import type { AppTheme } from './types';

export function applyTheme(theme: AppTheme): void {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
}
