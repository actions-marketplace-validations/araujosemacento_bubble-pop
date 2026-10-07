import { renderContributionSvg } from '@core/svg';
import type { PreviewState } from './types';

export class CanvasComponent {
  private container: HTMLElement;
  private statusElement: HTMLElement;
  private svgWrapper: HTMLElement;
  private lastRenderedUser: string | null = null;
  private lastRenderedCalendar: unknown = null;
  private lastRenderedDuration: number | null = null;
  private lastRenderedTheme: string | null = null;

  constructor(containerId: string, statusId: string, svgWrapperId: string) {
    const container = document.getElementById(containerId);
    const status = document.getElementById(statusId);
    const wrapper = document.getElementById(svgWrapperId);

    if (!container || !status || !wrapper) {
      throw new Error(`Canvas elements missing: #${containerId}, #${statusId}, #${svgWrapperId}`);
    }

    this.container = container;
    this.statusElement = status;
    this.svgWrapper = wrapper;
  }

  render(state: PreviewState): void {
    if (state.isLoading) {
      this.statusElement.textContent = `Fetching contribution data for ${state.username}...`;
      this.statusElement.className = 'status-line status-loading';
      return;
    }

    if (state.errorMessage) {
      this.statusElement.textContent = state.errorMessage;
      this.statusElement.className = 'status-line status-notice';
    } else {
      this.statusElement.textContent = `Displaying live bubbling contribution grid for ${state.username}`;
      this.statusElement.className = 'status-line status-ready';
    }

    if (!state.calendar) {
      this.svgWrapper.innerHTML = '';
      this.lastRenderedCalendar = null;
      return;
    }

    const svgString = renderContributionSvg(state.calendar, {
      username: state.username,
      theme: state.theme,
      duration: state.duration,
    });

    const isOnlyThemeChange =
      this.lastRenderedUser === state.username &&
      this.lastRenderedCalendar === state.calendar &&
      this.lastRenderedDuration === state.duration &&
      this.lastRenderedTheme !== state.theme;

    const existingStyle = this.svgWrapper.querySelector('#bubble-pop-styles');

    if (isOnlyThemeChange && existingStyle) {
      const match = svgString.match(/<style id="bubble-pop-styles">([\s\S]*?)<\/style>/);
      if (match) {
        existingStyle.textContent = match[1];
        this.lastRenderedTheme = state.theme;
        return;
      }
    }

    this.svgWrapper.innerHTML = svgString;
    this.lastRenderedUser = state.username;
    this.lastRenderedCalendar = state.calendar;
    this.lastRenderedDuration = state.duration;
    this.lastRenderedTheme = state.theme;
  }

  getSvgString(): string | null {
    const svg = this.svgWrapper.querySelector('svg');
    return svg ? svg.outerHTML : null;
  }
}
