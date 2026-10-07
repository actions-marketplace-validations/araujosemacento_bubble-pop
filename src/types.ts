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
  theme?:
    | 'auto'
    | 'dark'
    | 'light'
    | 'rose-pine'
    | 'rose-pine-dawn'
    | 'gitlab-dark'
    | 'gitlab-light'
    | 'codeberg-dark'
    | 'codeberg-light'
    | 'dracula'
    | 'alucard'
    | 'mocha'
    | 'latte'
    | string;
  username?: string;
  showLegend?: boolean;
}
