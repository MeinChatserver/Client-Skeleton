const registeredWindows = new WeakSet<Window>();

export function registerCustomElements(targetWindow: Window | null): void {
  if(!targetWindow || !targetWindow.customElements || registeredWindows.has(targetWindow)) {
    return;
  }

  injectStyles(targetWindow);
  defineUiLink(targetWindow);

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
