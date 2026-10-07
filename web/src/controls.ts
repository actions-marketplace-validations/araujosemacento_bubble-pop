import { store, THEMES } from './store';
import { applyTheme } from './theme';
import { downloadSvgFile, generateWorkflowYaml, generateMarkdownBadge, copyToClipboard } from './exporter';
import type { AppTheme } from './types';

export class ControlsComponent {
  private form: HTMLFormElement;
  private usernameInput: HTMLInputElement;
  private avatarImg: HTMLImageElement;
  private avatarFallback: SVGElement;
  private selectContainer: HTMLElement;
  private selectTrigger: HTMLButtonElement;
  private selectDropdown: HTMLElement;
  private selectCurrent: HTMLElement;
  private themeItems: NodeListOf<HTMLButtonElement>;
  private durationInput: HTMLInputElement;
  private durationValue: HTMLElement;
  private patInput: HTMLInputElement;
  private patToggleBtn: HTMLButtonElement;
  private patContainer: HTMLElement;

  private copyInput: HTMLInputElement;
  private copyTabs: NodeListOf<HTMLButtonElement>;
  private copyBtn: HTMLButtonElement;
  private downloadBtn: HTMLButtonElement;
  private activeFormat: 'markdown' | 'workflow' | 'svg' = 'markdown';
  private currentCopyPayload: string = '';

  private onSearchCallback: (username: string, token: string) => void;
  private getSvgCallback: () => string | null;

  constructor(
    onSearch: (username: string, token: string) => void,
    getSvg: () => string | null
  ) {
    this.onSearchCallback = onSearch;
    this.getSvgCallback = getSvg;

    this.form = document.getElementById('search-form') as HTMLFormElement;
    this.usernameInput = document.getElementById('username-input') as HTMLInputElement;
    this.avatarImg = document.getElementById('user-avatar-img') as HTMLImageElement;
    this.avatarFallback = document.getElementById('user-avatar-fallback') as unknown as SVGElement;
    this.selectContainer = document.getElementById('theme-select-container') as HTMLElement;
    this.selectTrigger = document.getElementById('theme-select-trigger') as HTMLButtonElement;
    this.selectDropdown = document.getElementById('theme-dropdown') as HTMLElement;
    this.selectCurrent = document.getElementById('select-current') as HTMLElement;
    this.themeItems = document.querySelectorAll<HTMLButtonElement>('.theme-item');
    this.durationInput = document.getElementById('duration-input') as HTMLInputElement;
    this.durationValue = document.getElementById('duration-value') as HTMLElement;
    this.patInput = document.getElementById('pat-input') as HTMLInputElement;
    this.patToggleBtn = document.getElementById('pat-toggle-btn') as HTMLButtonElement;
    this.patContainer = document.getElementById('pat-container') as HTMLElement;

    this.copyInput = document.getElementById('copy-input') as HTMLInputElement;
    this.copyTabs = document.querySelectorAll<HTMLButtonElement>('.copy-tab');
    this.copyBtn = document.getElementById('copy-btn') as HTMLButtonElement;
    this.downloadBtn = document.getElementById('download-btn') as HTMLButtonElement;

    this.bindEvents();
    this.updateThemeUI(store.getState().theme);
    this.updateCopyField();
  }

  private bindEvents(): void {
    // Avatar image load / error handling
    this.avatarImg.addEventListener('error', () => {
      this.avatarImg.style.display = 'none';
      if (this.avatarFallback) {
        this.avatarFallback.classList.remove('hidden');
      }
    });

    this.avatarImg.addEventListener('load', () => {
      this.avatarImg.style.display = 'block';
      if (this.avatarFallback) {
        this.avatarFallback.classList.add('hidden');
      }
    });

    // Form submission
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = this.usernameInput.value.trim() || 'octocat';
      this.handleUserChange(username);
    });

    // Preset profile clicks
    const presetButtons = document.querySelectorAll<HTMLButtonElement>('.preset-btn');
    presetButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const username = btn.getAttribute('data-user');
        if (username) {
          this.usernameInput.value = username;
          this.handleUserChange(username);
        }
      });
    });

    // Expandable theme select trigger
    this.selectTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (this.selectContainer && !this.selectContainer.contains(e.target as Node)) {
        this.closeDropdown();
      }
    });

    // Close dropdown on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeDropdown();
      }
    });

    // Divided theme picker buttons
    this.themeItems.forEach((btn) => {
      btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-theme') as AppTheme;
        if (theme && THEMES.includes(theme)) {
          store.setTheme(theme);
          applyTheme(theme);
          this.updateThemeUI(theme);
          this.updateCopyField();
          this.closeDropdown();
        }
      });
    });

    // Duration slider
    this.durationInput.addEventListener('input', () => {
      const val = parseFloat(this.durationInput.value);
      this.durationValue.textContent = `${val.toFixed(1)}s`;
      store.setDuration(val);
    });

    // PAT toggle
    this.patToggleBtn.addEventListener('click', () => {
      const isHidden = this.patContainer.classList.contains('hidden');
      if (isHidden) {
        this.patContainer.classList.remove('hidden');
        this.patToggleBtn.textContent = 'hide token input';
      } else {
        this.patContainer.classList.add('hidden');
        this.patToggleBtn.textContent = 'personal access token';
      }
    });

    // Copy format tabs
    this.copyTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const format = tab.getAttribute('data-format') as 'markdown' | 'workflow' | 'svg';
        if (format) {
          this.activeFormat = format;
          this.copyTabs.forEach((t) => t.classList.toggle('active', t === tab));
          this.updateCopyField();
        }
      });
    });

    // Copy button
    this.copyBtn.addEventListener('click', async () => {
      const textToCopy = this.currentCopyPayload || this.copyInput.value;
      if (!textToCopy) return;

      const success = await copyToClipboard(textToCopy);
      if (success) {
        this.showToast(`copied ${this.activeFormat} to clipboard`);
      } else {
        this.showToast('copy to clipboard failed');
      }
    });

    // Download button
    this.downloadBtn.addEventListener('click', () => {
      const svg = this.getSvgCallback();
      if (svg) {
        const state = store.getState();
        downloadSvgFile(state.username, svg);
        this.showToast(`downloaded bubble-pop-${state.username}.svg`);
      } else {
        this.showToast('no svg available to download');
      }
    });
  }

  private handleUserChange(username: string): void {
    store.setUsername(username);
    this.updateAvatar(username);
    this.onSearchCallback(username, this.patInput.value.trim());
    this.updateCopyField();
  }

  private updateAvatar(username: string): void {
    if (username.toLowerCase() === 'mock') {
      this.avatarImg.style.display = 'none';
      if (this.avatarFallback) {
        this.avatarFallback.classList.remove('hidden');
      }
      return;
    }

    this.avatarImg.style.display = 'block';
    if (this.avatarFallback) {
      this.avatarFallback.classList.add('hidden');
    }
    this.avatarImg.src = `https://github.com/${username}.png?size=120`;
  }

  private updateThemeUI(theme: AppTheme): void {
    if (this.selectCurrent) {
      this.selectCurrent.textContent = theme;
    }
    if (this.themeItems) {
      this.themeItems.forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-theme') === theme);
      });
    }
  }

  private toggleDropdown(): void {
    const isExpanded = this.selectTrigger.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  private openDropdown(): void {
    this.selectContainer.classList.add('open');
    this.selectDropdown.classList.remove('hidden');
    this.selectTrigger.setAttribute('aria-expanded', 'true');
  }

  private closeDropdown(): void {
    this.selectContainer.classList.remove('open');
    this.selectDropdown.classList.add('hidden');
    this.selectTrigger.setAttribute('aria-expanded', 'false');
  }

  public updateCopyField(): void {
    const state = store.getState();
    const username = state.username;
    const theme = state.theme;

    if (this.activeFormat === 'markdown') {
      const md = generateMarkdownBadge(username);
      this.currentCopyPayload = md;
      this.copyInput.value = md;
    } else if (this.activeFormat === 'workflow') {
      const yml = generateWorkflowYaml(username, theme);
      this.currentCopyPayload = yml;
      this.copyInput.value = yml;
    } else if (this.activeFormat === 'svg') {
      const svg = this.getSvgCallback() || '<svg><!-- SVG will generate once data is loaded --></svg>';
      this.currentCopyPayload = svg;
      this.copyInput.value = svg;
    }
  }

  private showToast(message: string): void {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }
}
