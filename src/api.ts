import type { ContributionCalendar, ContributionDay, ContributionWeek } from './types';

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

interface GraphQLResponse {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: ContributionCalendar;
      };
    };
  };
  errors?: Array<{ message: string }>;
}

export async function fetchUserContributions(
  username: string,
  token: string
): Promise<ContributionCalendar> {
  const response = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'github-action-bubble-pop',
    },
    body: JSON.stringify({
      query: CONTRIBUTION_QUERY,
      variables: { userName: username },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `GitHub API request failed: ${response.status} ${response.statusText}`
    );
  }

  const json = (await response.json()) as GraphQLResponse;

  if (json.errors && json.errors.length > 0) {
    throw new Error(
      `GitHub GraphQL error: ${json.errors.map((e) => e.message).join(', ')}`
    );
  }

  const calendar = json.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar) {
    throw new Error(`Could not find contribution data for user "${username}".`);
  }

  return calendar;
}

/**
 * Generates a realistic mock contribution calendar for local testing & previewing.
 */
export function generateMockCalendar(): ContributionCalendar {
  const weeks: ContributionWeek[] = [];
  const palette = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];
  const now = new Date();
  let totalContributions = 0;

  // 53 weeks
  for (let w = 52; w >= 0; w--) {
    const days: ContributionDay[] = [];
    for (let d = 0; d < 7; d++) {
      const dayOffset = w * 7 + (6 - d);
      const date = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
      
      // Pseudo-random realistic distribution with clusters
      const rand = Math.random();
      let level = 0;
      let count = 0;
      if (rand > 0.4) {
        level = 1;
        count = Math.floor(Math.random() * 3) + 1;
      }
      if (rand > 0.7) {
        level = 2;
        count = Math.floor(Math.random() * 5) + 3;
      }
      if (rand > 0.88) {
        level = 3;
        count = Math.floor(Math.random() * 7) + 6;
      }
      if (rand > 0.96) {
        level = 4;
        count = Math.floor(Math.random() * 15) + 10;
      }

      totalContributions += count;
      days.push({
        date: date.toISOString().split('T')[0],
        contributionCount: count,
        color: palette[level],
        weekday: d,
      });
    }
    weeks.push({ contributionDays: days });
  }

  return {
    totalContributions,
    weeks,
  };
}
