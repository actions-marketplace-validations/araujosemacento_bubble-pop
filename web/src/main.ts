import { store } from './store';
import { applyTheme } from './theme';
import { loadContributionCalendar } from './adapter';
import { CanvasComponent } from './canvas';
import { ControlsComponent } from './controls';

async function performSearch(username: string, token: string): Promise<void> {
  store.setLoading(true);

  try {
    const { calendar, isMockFallback } = await loadContributionCalendar(username, token);
    const notice = isMockFallback
      ? `Displaying simulated contribution data for ${username} (public lookup unavailable or rate-limited)`
      : null;

    store.setCalendar(calendar, notice);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    store.setError(`Failed to fetch contribution data: ${message}`);
  }
}

function init(): void {
  // Apply initial theme
  applyTheme(store.getState().theme);

  // Initialize Canvas stage
  const canvas = new CanvasComponent('stage-container', 'status-line', 'svg-wrapper');

  // Initialize Controls
  const controls = new ControlsComponent(
    (username, token) => {
      performSearch(username, token);
    },
    () => canvas.getSvgString()
  );

  // Subscribe Canvas and Controls to store state changes
  store.subscribe((state) => {
    canvas.render(state);
    controls.updateCopyField();
  });

  // Trigger initial render with default user
  const initialUsername = store.getState().username;
  performSearch(initialUsername, '');
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
