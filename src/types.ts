export interface ContributionDay {
  date: string;
  contributionCount: number;
  color: string;
  weekday: number;
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface ContributionCalendar {
  totalContributions: number;
  weeks: ContributionWeek[];
}

export interface RenderOptions {
  cellSize?: number;
  cellGap?: number;
  cellRadius?: number;
  duration?: number;
  theme?: 'auto' | 'dark' | 'light';
  username?: string;
  showLegend?: boolean;
}
