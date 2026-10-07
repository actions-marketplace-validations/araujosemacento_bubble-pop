import type { ContributionCalendar } from '@core/types';

export type AppTheme =
  | 'auto'
  | 'dark'
  | 'light'
  | 'rose-pine'
  | 'rose-pine-dawn'
  | 'dracula'
  | 'alucard'
  | 'mocha'
  | 'latte'
  | 'gitlab-dark'
  | 'gitlab-light'
  | 'codeberg-dark'
  | 'codeberg-light';

export interface PreviewState {
  username: string;
  theme: AppTheme;
  duration: number;
  personalAccessToken: string;
  calendar: ContributionCalendar | null;
  isLoading: boolean;
  errorMessage: string | null;
  lastUpdated: number;
}

export interface PresetProfile {
  username: string;
  displayName: string;
}
