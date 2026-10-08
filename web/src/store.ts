import type { AppTheme, PreviewState } from './types';
import type { ContributionCalendar } from '@core/types';

export const THEMES: AppTheme[] = [
  'auto',
  'dark',
  'gitlab-dark',
  'codeberg-dark',
  'rose-pine',
  'dracula',
  'mocha',
  'light',
  'gitlab-light',
  'codeberg-light',
  'rose-pine-dawn',
  'alucard',
  'latte',
];

type Listener = (state: PreviewState) => void;

class PreviewStore {
  private state: PreviewState = {
    username: 'octocat',
    theme: 'auto',
    duration: 5.5,
    personalAccessToken: '',
    calendar: null,
    isLoading: false,
    errorMessage: null,
    showHeader: true,
    showLabels: true,
    showAvatar: false,
    lastUpdated: Date.now(),
  };

  private listeners: Set<Listener> = new Set();

  getState(): PreviewState {
    return { ...this.state };
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const currentState = this.getState();
    this.listeners.forEach((listener) => listener(currentState));
  }

  update(partial: Partial<PreviewState>): void {
    this.state = {
      ...this.state,
      ...partial,
      lastUpdated: Date.now(),
    };
    this.notify();
  }

  setUsername(username: string): void {
    if (this.state.username !== username) {
      this.update({ username });
    }
  }

  setTheme(theme: AppTheme): void {
    if (this.state.theme !== theme) {
      this.update({ theme });
    }
  }

  cycleTheme(): AppTheme {
    const currentIndex = THEMES.indexOf(this.state.theme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    const nextTheme = THEMES[nextIndex];
    this.setTheme(nextTheme);
    return nextTheme;
  }

  setDuration(duration: number): void {
    if (this.state.duration !== duration) {
      this.update({ duration });
    }
  }

  setToken(token: string): void {
    this.update({ personalAccessToken: token });
  }

  setLoading(isLoading: boolean): void {
    this.update({ isLoading, errorMessage: isLoading ? null : this.state.errorMessage });
  }

  setCalendar(calendar: ContributionCalendar, errorMessage: string | null = null): void {
    this.update({ calendar, isLoading: false, errorMessage });
  }

  setError(errorMessage: string): void {
    this.update({ isLoading: false, errorMessage });
  }

  setShowHeader(showHeader: boolean): void {
    if (this.state.showHeader !== showHeader) {
      this.update({ showHeader });
    }
  }

  setShowLabels(showLabels: boolean): void {
    if (this.state.showLabels !== showLabels) {
      this.update({ showLabels });
    }
  }

  setShowAvatar(showAvatar: boolean): void {
    if (this.state.showAvatar !== showAvatar) {
      this.update({ showAvatar });
    }
  }
}

export const store = new PreviewStore();
