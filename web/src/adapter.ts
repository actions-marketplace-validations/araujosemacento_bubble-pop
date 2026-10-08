import { generateMockCalendar } from '@core/api';
import type { ContributionCalendar, ContributionDay, ContributionWeek } from '@core/types';

interface PublicApiResponse {
  total?: {
    [key: string]: number;
  };
  contributions?: Array<{
    date: string;
    count: number;
    level: number;
  }>;
}

const PUBLIC_API_BASE = 'https://github-contributions-api.jogruber.de/v4';
const GITHUB_GRAPHQL_ENDPOINT = 'https://api.github.com/graphql';

const CONTRIBUTION_QUERY = `
query($userName: String!) {
  user(login: $userName) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            contributionCount
            date
            color
            weekday
          }
        }
      }
    }
  }
}
`;

const LEVEL_COLORS_DEFAULT = [
  '#161b22',
  '#0e4429',
  '#006d32',
  '#26a641',
  '#39d353',
];

/**
 * Normalizes flat day array from public aggregator API into 53 weeks of 7 days.
 */
function normalizeFlatDaysToCalendar(
  flatDays: Array<{ date: string; count: number; level: number }>,
  totalContributions: number
): ContributionCalendar {
  const weeks: ContributionWeek[] = [];
  let currentWeekDays: ContributionDay[] = [];

  for (let i = 0; i < flatDays.length; i++) {
    const item = flatDays[i];
    const dateObj = new Date(item.date);
    const weekday = dateObj.getDay();

    currentWeekDays.push({
      date: item.date,
      contributionCount: item.count,
      color: LEVEL_COLORS_DEFAULT[Math.min(item.level, 4)] || LEVEL_COLORS_DEFAULT[0],
      weekday,
    });

    // Complete week on Saturday (weekday 6) or end of array
    if (weekday === 6 || i === flatDays.length - 1) {
      weeks.push({ contributionDays: currentWeekDays });
      currentWeekDays = [];
    }
  }

  return {
    totalContributions,
    weeks,
  };
}

/**
 * Fetches contribution calendar via personal access token using GitHub GraphQL API.
 */
async function fetchViaToken(username: string, token: string): Promise<ContributionCalendar> {
  const res = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: CONTRIBUTION_QUERY,
      variables: { userName: username },
    }),
  });

  if (!res.ok) {
    throw new Error(`GitHub API HTTP ${res.status}: ${res.statusText}`);
  }

  const json = await res.json();
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message);
  }

  const calendar = json.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar) {
    throw new Error(`User "${username}" was not found on GitHub.`);
  }

  return calendar;
}

/**
 * Fetches contribution calendar via public aggregator API.
 */
async function fetchViaPublicApi(username: string): Promise<ContributionCalendar> {
  const url = `${PUBLIC_API_BASE}/${encodeURIComponent(username)}?y=last`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Public contributions lookup failed with HTTP ${res.status}`);
  }

  const data = (await res.json()) as PublicApiResponse;
  if (!data.contributions || data.contributions.length === 0) {
    throw new Error(`No contribution data available for user "${username}".`);
  }

  const total = data.total?.lastYear ?? data.contributions.reduce((acc, c) => acc + c.count, 0);
  return normalizeFlatDaysToCalendar(data.contributions, total);
}

/**
 * Primary decoupled adapter function to fetch contribution data.
 */
export async function loadContributionCalendar(
  username: string,
  personalAccessToken?: string
): Promise<{ calendar: ContributionCalendar; isMockFallback: boolean }> {
  // If explicitly requested mock data, return mock generator immediately
  if (username.toLowerCase() === 'mock') {
    return { calendar: generateMockCalendar(), isMockFallback: false };
  }

  // If user provided a PAT, query GraphQL directly
  if (personalAccessToken && personalAccessToken.trim().length > 0) {
    try {
      const calendar = await fetchViaToken(username, personalAccessToken.trim());
      return { calendar, isMockFallback: false };
    } catch (err) {
      console.warn('[adapter] PAT fetch failed, attempting public API fallback:', err);
    }
  }

  // Attempt public aggregator API
  try {
    const calendar = await fetchViaPublicApi(username);
    return { calendar, isMockFallback: false };
  } catch (err) {
    console.warn('[adapter] Public API fetch failed, falling back to mock calendar:', err);
    const mockCalendar = generateMockCalendar();
    return { calendar: mockCalendar, isMockFallback: true };
  }
}
