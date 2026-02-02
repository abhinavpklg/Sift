/**
 * FillOverlay - CSP-Safe Floating UI
 * All styles come from content.css (no inline styles)
 */

export type OverlayStatus = 'detecting' | 'filling' | 'filled' | 'error' | 'idle';

export interface OverlayCallbacks {
  onFillClick: () => void;
  onNextClick: () => void;
  onClose: () => void;
}

export class FillOverlay {
  private container: HTMLDivElement | null = null;
  private callbacks: OverlayCallbacks;
  private status: OverlayStatus = 'detecting';
  private fieldCount = 0;
  private filledCount = 0;
  private isMinimized = false;
  private autoFill = true;
  private autoNext = false;

  constructor(callbacks: OverlayCallbacks) {
    this.callbacks = callbacks;
  }

  show(): void {
    if (this.container) return;
    this.createOverlay();
    this.loadSettings();
  }

  hide(): void {
    this.container?.remove();
    this.container = null;
  }

  setStatus(status: OverlayStatus, message?: string): void {
    this.status = status;
    this.render(message);
  }

  setProgress(filled: number, total: number): void {
    this.filledCount = filled;
    this.fieldCount = total;
    this.render();
  }

  setFieldCount(count: number): void {
    this.fieldCount = count;
    this.render();
  }

  isAutoFillEnabled(): boolean {
    return this.autoFill;
  }

  isAutoNextEnabled(): boolean {
    return this.autoNext;
  }

  private createOverlay(): void {
    this.container = document.createElement('div');
    this.container.id = 'sift-overlay';
    document.body.appendChild(this.container);
    this.render();
    this.makeDraggable();
  }

  private render(message?: string): void {
    if (!this.container) return;

    // Determine what to show based on status
    const showSpinner = this.status === 'detecting' || this.status === 'filling';
    const showCheck = this.status === 'filled';
    const showError = this.status === 'error';
    const showProgress = this.status === 'filling' || this.status === 'filled';
    const btnDisabled = this.status === 'detecting' || this.status === 'filling';

    let statusText = message || '';
    if (!message) {
      switch (this.status) {
        case 'detecting': statusText = 'Detecting form...'; break;
        case 'filling': statusText = 'Filling application...'; break;
        case 'filled': statusText = `Filled ${this.filledCount} fields`; break;
        case 'error': statusText = 'Error - check console'; break;
        case 'idle': statusText = `${this.fieldCount} fields detected`; break;
      }
    }

    const progressPercent = this.fieldCount > 0 ? Math.round((this.filledCount / this.fieldCount) * 100) : 0;

    this.container.innerHTML = `
      <div class="sift-card${this.isMinimized ? ' sift-minimized' : ''}">
        <div class="sift-header">
          <div class="sift-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <span>Sift</span>
          </div>
          <div class="sift-header-btns">
            <button class="sift-icon-btn" id="sift-min-btn" title="Minimize">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <path d="M5 12h14"></path>
              </svg>
            </button>
            <button class="sift-icon-btn" id="sift-close-btn" title="Close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <path d="M18 6L6 18M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="sift-body">
          <div class="sift-status-row">
            <div class="sift-spinner${showSpinner ? '' : ' sift-hidden'}"></div>
            <svg class="sift-check${showCheck ? '' : ' sift-hidden'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 6L9 17l-5-5"></path>
            </svg>
            <svg class="sift-error-icon${showError ? '' : ' sift-hidden'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M15 9l-6 6M9 9l6 6"></path>
            </svg>
            <span class="sift-status-text">${statusText}</span>
          </div>
          <div class="sift-progress${showProgress ? '' : ' sift-hidden'}">
            <div class="sift-progress-track">
              <div class="sift-progress-bar" style="width: ${progressPercent}%"></div>
            </div>
            <span class="sift-progress-label">${this.filledCount}/${this.fieldCount} fields</span>
          </div>
          <div class="sift-buttons">
            <button class="sift-btn sift-btn-fill" id="sift-fill-btn"${btnDisabled ? ' disabled' : ''}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              ${this.status === 'filled' ? 'Re-fill' : 'Fill Form'}
            </button>
            <button class="sift-btn sift-btn-next" id="sift-next-btn">
              Next
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
          <div class="sift-options">
            <label class="sift-option">
              <input type="checkbox" id="sift-auto-fill"${this.autoFill ? ' checked' : ''}>
              <span>Auto-fill</span>
            </label>
            <label class="sift-option">
              <input type="checkbox" id="sift-auto-next"${this.autoNext ? ' checked' : ''}>
              <span>Auto-next</span>
            </label>
          </div>
        </div>
      </div>
    `;

    this.attachListeners();
  }

  private attachListeners(): void {
    if (!this.container) return;

    this.container.querySelector('#sift-close-btn')?.addEventListener('click', () => {
      this.callbacks.onClose();
    });

    this.container.querySelector('#sift-min-btn')?.addEventListener('click', () => {
      this.isMinimized = !this.isMinimized;
      this.render();
    });

    this.container.querySelector('#sift-fill-btn')?.addEventListener('click', () => {
      this.callbacks.onFillClick();
    });

    this.container.querySelector('#sift-next-btn')?.addEventListener('click', () => {
      this.callbacks.onNextClick();
    });

    this.container.querySelector('#sift-auto-fill')?.addEventListener('change', (e) => {
      this.autoFill = (e.target as HTMLInputElement).checked;
      this.saveSettings();
    });

    this.container.querySelector('#sift-auto-next')?.addEventListener('change', (e) => {
      this.autoNext = (e.target as HTMLInputElement).checked;
      this.saveSettings();
    });
  }

  private makeDraggable(): void {
    if (!this.container) return;
    
    let isDragging = false;
    let offsetX = 0, offsetY = 0;

    const header = this.container.querySelector('.sift-header') as HTMLElement;
    if (!header) return;

    header.addEventListener('mousedown', (e) => {
      if ((e.target as HTMLElement).closest('button')) return;
      isDragging = true;
      const rect = this.container!.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging || !this.container) return;
      const x = e.clientX - offsetX;
      const y = e.clientY - offsetY;
      this.container.style.left = `${Math.max(0, x)}px`;
      this.container.style.top = `${Math.max(0, y)}px`;
      this.container.style.right = 'auto';
      this.container.style.bottom = 'auto';
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  private async loadSettings(): Promise<void> {
    try {
      const result = await chrome.storage.local.get(['siftAutoFill', 'siftAutoNext']);
      this.autoFill = result.siftAutoFill !== false;
      this.autoNext = result.siftAutoNext === true;
      this.render();
    } catch (e) {
      console.error('[Sift] Failed to load settings:', e);
    }
  }

  private async saveSettings(): Promise<void> {
    try {
      await chrome.storage.local.set({
        siftAutoFill: this.autoFill,
        siftAutoNext: this.autoNext,
      });
    } catch (e) {
      console.error('[Sift] Failed to save settings:', e);
    }
  }
}

export default FillOverlay;
