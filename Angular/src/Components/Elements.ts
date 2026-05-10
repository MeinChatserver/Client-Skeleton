const registeredWindows = new WeakSet<Window>();

export function registerCustomElements(targetWindow: Window | null): void {
  if(!targetWindow || !targetWindow.customElements || registeredWindows.has(targetWindow)) {
    return;
  }

  injectStyles(targetWindow);
  defineUiLink(targetWindow);
  defineUiColor(targetWindow);

  registeredWindows.add(targetWindow);
}

function injectStyles(targetWindow: Window): void {
  const doc = targetWindow.document;

  if(!doc || doc.getElementById('ui-link-styles')) {
    return;
  }

  const style = doc.createElement('style');
  style.id = 'ui-link-styles';
  style.textContent = `
    ui-link {
      cursor: pointer;
      position: relative;
      display: inline-block;
      text-decoration: none;
      color: var(--room-blue);
    }

   ui-link::after {
      content: "";
      background: var(--room-blue);
      position: absolute;
      left: 0;
      right: 0;
      bottom: 3px;
      height: 1px;
    }

   ui-link:hover {
      color: var(--room-foreground);
    }

   ui-link:hover::after {
     background: var(--room-foreground);
   }
  `;

  doc.head.appendChild(style);
}

function defineUiLink(targetWindow: Window): void {
  if(targetWindow.customElements.get('ui-link')) {
    return;
  }

  const HTMLElementCtor = (targetWindow as any).HTMLElement as typeof HTMLElement;

  class UiLink extends HTMLElementCtor {
    private initialized = false;
    private boundClick  = (event: Event) => this.onClick(event as MouseEvent);

    connectedCallback(): void {
      if(this.initialized) {
        return;
      }

      this.initialized = true;
      (this as unknown as HTMLElement).addEventListener('click', this.boundClick);
    }

    disconnectedCallback(): void {
      (this as unknown as HTMLElement).removeEventListener('click', this.boundClick);
    }

    private onClick(event: MouseEvent): void {
      const host   = this as unknown as HTMLElement;
      const action = host.getAttribute('data-action');

      if(action) {
        event.preventDefault();
        event.stopPropagation();

        host.dispatchEvent(new CustomEvent('ui-command', {
          detail:   action,
          bubbles:  true,
          composed: true
        }));

        return;
      }

      const url    = host.getAttribute('url');
      const target = host.getAttribute('target');

      if(!url) {
        event.preventDefault();
        return;
      }

      if(target === 'n') {
        event.preventDefault();
        targetWindow.open(url, '_blank');
      } else if(target === 'p') {
        event.preventDefault();

        const width  = 600;
        const height = 400;
        const left   = (targetWindow.innerWidth - width) / 2;
        const top    = (targetWindow.innerHeight - height) / 2;

        targetWindow.open(
          url,
          'popup',
          `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );
      }
    }
  }

  try {
    targetWindow.customElements.define('ui-link', UiLink as unknown as CustomElementConstructor);
  } catch(error) {
    console.warn('[Elements] Konnte <ui-link> nicht registrieren:', error);
  }
}

function parseColor(raw: string | null): string | null {
  if(!raw) {
    return null;
  }

  const value = raw.trim();

  if(!value) {
    return null;
  }

  if(value.startsWith('#')) {
    return value;
  }

  const lower = value.toLowerCase();

  if(lower.startsWith('rgb')) {
    return value;
  }

  const parts = value.split(',').map(part => part.trim()).filter(part => part.length > 0);

  if(parts.length === 3) {
    const [r, g, b] = parts.map(part => clampByte(parseFloat(part)));
    return `rgb(${r}, ${g}, ${b})`;
  }

  if(parts.length === 4) {
    const [r, g, b] = parts.slice(0, 3).map(part => clampByte(parseFloat(part)));
    const alphaPct  = Math.max(0, Math.min(100, parseFloat(parts[3])));
    const alpha     = Math.round((alphaPct / 100) * 1000) / 1000;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  return null;
}

function clampByte(n: number): number {
  if(Number.isNaN(n)) {
    return 0;
  }

  return Math.max(0, Math.min(255, Math.round(n)));
}

function defineUiColor(targetWindow: Window): void {
  if(targetWindow.customElements.get('ui-color')) {
    return;
  }

  const HTMLElementCtor = (targetWindow as any).HTMLElement as typeof HTMLElement;

  class UiColor extends HTMLElementCtor {
    static get observedAttributes(): string[] {
      return ['value'];
    }

    connectedCallback(): void {
      this.applyColor();
    }

    attributeChangedCallback(name: string): void {
      if(name === 'value') {
        this.applyColor();
      }
    }

    private applyColor(): void {
      const host  = this as unknown as HTMLElement;
      const color = parseColor(host.getAttribute('value'));

      if(color) {
        host.style.color = color;
      } else {
        host.style.removeProperty('color');
      }
    }
  }

  try {
    targetWindow.customElements.define('ui-color', UiColor as unknown as CustomElementConstructor);
  } catch(error) {
    console.warn('[Elements] Konnte <ui-color> nicht registrieren:', error);
  }
}
