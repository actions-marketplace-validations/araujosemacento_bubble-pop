import { store, THEMES } from './store';
import { applyTheme } from './theme';
import { downloadSvgFile, generateWorkflowYaml, generateMarkdownBadge, copyToClipboard } from './exporter';
import type { AppTheme } from './types';

interface PresetBio {
  name: string;
  bio: string;
}

const PRESET_BIOS: Record<string, PresetBio> = {
  octocat: {
    name: 'Mona the Octocat',
    bio: "GitHub's official mascot, an octopus-cat hybrid. (No idea why)",
  },
  torvalds: {
    name: 'Linus Torvalds',
    bio: 'Creator and principal developer of the Linux kernel and the Git version control system.',
  },
  antirez: {
    name: 'Salvatore Sanfilippo',
    bio: 'Italian software developer, author and creator of the open source in-memory data store Redis.',
  },
  yyx990803: {
    name: 'Evan You',
    bio: 'Creator of the Vue.js JavaScript framework and the Vite frontend build tool.',
  },
  gaearon: {
    name: 'Dan Abramov',
    bio: 'Software engineer, co-author of Redux and Create React App, and former React core team member.',
  },
};

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
  private toggleHeaderBtn: HTMLButtonElement;
  private toggleLabelsBtn: HTMLButtonElement;
  private toggleAvatarBtn: HTMLButtonElement;

  private presetTooltip: HTMLElement;
  private presetTooltipTitle: HTMLElement;
  private presetTooltipDesc: HTMLElement;
  private presetTooltipClose: HTMLButtonElement;
  private activeTooltipUser: string | null = null;

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
    this.toggleHeaderBtn = document.getElementById('toggle-header-btn') as HTMLButtonElement;
    this.toggleLabelsBtn = document.getElementById('toggle-labels-btn') as HTMLButtonElement;
    this.toggleAvatarBtn = document.getElementById('toggle-avatar-btn') as HTMLButtonElement;

    this.presetTooltip = document.getElementById('preset-tooltip') as HTMLElement;
    this.presetTooltipTitle = document.getElementById('preset-tooltip-title') as HTMLElement;
    this.presetTooltipDesc = document.getElementById('preset-tooltip-desc') as HTMLElement;
    this.presetTooltipClose = document.getElementById('preset-tooltip-close') as HTMLButtonElement;

    this.copyInput = document.getElementById('copy-input') as HTMLInputElement;
    this.copyTabs = document.querySelectorAll<HTMLButtonElement>('.copy-tab');
    this.copyBtn = document.getElementById('copy-btn') as HTMLButtonElement;
    this.downloadBtn = document.getElementById('download-btn') as HTMLButtonElement;

    this.bindEvents();
    this.updateThemeUI(store.getState().theme);
    this.updateTogglesUI();
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
        this.closePresetTooltip();
        const username = btn.getAttribute('data-user');
        if (username) {
          this.usernameInput.value = username;
          this.handleUserChange(username);
        }
      });
    });

    // Preset contextual info buttons
    const infoButtons = document.querySelectorAll<HTMLButtonElement>('.preset-info-btn');
    infoButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const user = btn.getAttribute('data-info-user');
        if (user) {
          this.togglePresetTooltip(user, btn);
        }
      });
    });

    // Preset tooltip close button
    if (this.presetTooltipClose) {
      this.presetTooltipClose.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closePresetTooltip();
      });
    }

    // Expandable theme select trigger
    this.selectTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    });

    // Close dropdown and tooltip on outside click
    document.addEventListener('click', (e) => {
      if (this.selectContainer && !this.selectContainer.contains(e.target as Node)) {
        this.closeDropdown();
      }
      if (this.activeTooltipUser && this.presetTooltip && !this.presetTooltip.contains(e.target as Node)) {
        this.closePresetTooltip();
      }
    });

    // Close dropdown and tooltip on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeDropdown();
        this.closePresetTooltip();
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

    // Toggles for header, labels, and avatar
    if (this.toggleHeaderBtn) {
      this.toggleHeaderBtn.addEventListener('click', () => {
        const next = !store.getState().showHeader;
        store.setShowHeader(next);
        this.updateTogglesUI();
        this.updateCopyField();
      });
    }

    if (this.toggleLabelsBtn) {
      this.toggleLabelsBtn.addEventListener('click', () => {
        const next = !store.getState().showLabels;
        store.setShowLabels(next);
        this.updateTogglesUI();
        this.updateCopyField();
      });
    }

    if (this.toggleAvatarBtn) {
      this.toggleAvatarBtn.addEventListener('click', () => {
        const state = store.getState();
        const nextAvatar = !state.showAvatar;
        if (nextAvatar && !state.showHeader) {
          store.setShowHeader(true);
        }
        store.setShowAvatar(nextAvatar);
        this.updateTogglesUI();
        this.updateCopyField();
      });
    }

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
    this.closePresetTooltip();
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
      const yml = generateWorkflowYaml(username, {
        theme,
        showHeader: state.showHeader,
        showLabels: state.showLabels,
        showAvatar: state.showAvatar,
      });
      this.currentCopyPayload = yml;
      this.copyInput.value = yml;
    } else if (this.activeFormat === 'svg') {
      const svg = this.getSvgCallback() || '<svg><!-- SVG will generate once data is loaded --></svg>';
      this.currentCopyPayload = svg;
      this.copyInput.value = svg;
    }
  }

  private updateTogglesUI(): void {
    const state = store.getState();
    if (this.toggleHeaderBtn) {
      this.toggleHeaderBtn.classList.toggle('active', state.showHeader);
    }
    if (this.toggleLabelsBtn) {
      this.toggleLabelsBtn.classList.toggle('active', state.showLabels);
    }
    if (this.toggleAvatarBtn) {
      this.toggleAvatarBtn.classList.toggle('active', state.showAvatar);
      this.toggleAvatarBtn.disabled = !state.showHeader;
      this.toggleAvatarBtn.style.opacity = state.showHeader ? '1' : '0.4';
    }
  }

  private togglePresetTooltip(username: string, btn: HTMLButtonElement): void {
    if (this.activeTooltipUser === username && !this.presetTooltip.classList.contains('hidden')) {
      this.closePresetTooltip();
      return;
    }
    this.openPresetTooltip(username, btn);
  }

  private openPresetTooltip(username: string, btn: HTMLButtonElement): void {
    const bioData = PRESET_BIOS[username];
    if (!bioData || !this.presetTooltip) return;

    this.presetTooltipTitle.textContent = bioData.name;
    this.presetTooltipDesc.textContent = bioData.bio;

    const parentTag = btn.closest('.preset-tag') as HTMLElement | null;
    if (parentTag) {
      parentTag.appendChild(this.presetTooltip);
      parentTag.style.zIndex = '130';
      const subrow = parentTag.closest('.preset-subrow') as HTMLElement | null;
      if (subrow) subrow.style.zIndex = '130';
    }

    this.presetTooltip.style.left = '50%';
    this.presetTooltip.classList.remove('hidden');
    this.presetTooltip.setAttribute('aria-hidden', 'false');
    this.activeTooltipUser = username;

    document.querySelectorAll<HTMLButtonElement>('.preset-info-btn').forEach((b) => {
      b.classList.toggle('active', b === btn);
    });

    requestAnimationFrame(() => {
      if (!this.presetTooltip) return;
      const rect = this.presetTooltip.getBoundingClientRect();
      if (rect.left < 8) {
        this.presetTooltip.style.left = `calc(50% + ${8 - rect.left}px)`;
      } else if (rect.right > window.innerWidth - 8) {
        this.presetTooltip.style.left = `calc(50% - ${rect.right - (window.innerWidth - 8)}px)`;
      }
    });
  }

  private closePresetTooltip(): void {
    if (!this.presetTooltip) return;
    this.presetTooltip.classList.add('hidden');
    this.presetTooltip.setAttribute('aria-hidden', 'true');
    this.activeTooltipUser = null;
    document.querySelectorAll<HTMLElement>('.preset-tag, .preset-subrow').forEach((el) => {
      el.style.zIndex = '';
    });
    document.querySelectorAll<HTMLButtonElement>('.preset-info-btn').forEach((b) => {
      b.classList.remove('active');
    });
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
