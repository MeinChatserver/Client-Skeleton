import { ApplicationRef, ComponentRef, createComponent, EnvironmentInjector, Type } from '@angular/core';

export interface FrameConfig {
  id: string;
  title?: string;
  width?: number;
  height?: number;
  left?: number;
  top?: number;
  resizable?: boolean;
  scrollbars?: boolean;
}

export class Frame {
  protected frameWindow: Window | null = null;
  protected frameDocument: Document | null = null;
  protected watcherInterval: number | null = null;
  protected isDocumentInitialized = false;
  protected componentRef: ComponentRef<any> | null = null;
  protected isRebuilding = false;

  constructor(
    protected config: FrameConfig,
    protected appRef: ApplicationRef,
    protected injector: EnvironmentInjector
  ) {
    this.initialize();
  }

  getId() {
    return this.config.id;
  }

  protected initialize(): void {
    const features = this.buildWindowFeatures();

    this.frameWindow = window.open('', this.config.id, features);

    if(!this.frameWindow) {
      console.error('PopupFrame wurde blockiert oder konnte nicht geöffnet werden');
      return;
    }

    this.frameDocument = this.frameWindow.document;
    this.setupInitialDocument();
    this.startWatcher();
    this.setupCloseHandler();
  }

  protected buildWindowFeatures(): string {
    const features: string[] = [];

    // @ToDo wie im alten Clienten verbessern!
    if (this.config.width) features.push(`width=${this.config.width}`);
    if (this.config.height) features.push(`height=${this.config.height}`);
    if (this.config.left !== undefined) features.push(`left=${this.config.left}`);
    if (this.config.top !== undefined) features.push(`top=${this.config.top}`);

    features.push(`resizable=${this.config.resizable ? 'yes' : 'no'}`);
    features.push(`scrollbars=${this.config.scrollbars ? 'yes' : 'no'}`);

    return features.join(',');
  }

  protected setupInitialDocument(): void {
    if(!this.frameDocument) {
      return;
    }

    this.frameDocument.open();
    this.frameDocument.write(`<!DOCTYPE html>
      <html lang="de">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, shrink-to-fit=no" />
        <link rel="icon" href="./icon.svg" type="image/svg" />
        <link rel="manifest" href="./manifest.json" />
        <link rel="mask-icon" href="./icon.svg" color="#444444" />
        <link rel="icon" href="./icon.ico" />
        <meta name="theme-color" content="#444444" />
        <title>${this.config.title || 'Frame'}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: #ffffff;
            width: 100%;
            height: 100vh;
          }
        </style>
      </head>
      <body id="app-root"></body>
      </html>`);
    this.frameDocument.close();

    this.isDocumentInitialized = true;
    this.copyParentStyles();
  }

  protected copyParentStyles(): void {
    if(!this.frameDocument) {
      return;
    }

    const parentStyles = document.querySelectorAll('style, link[rel="stylesheet"]');

    parentStyles.forEach(styleElement => {
      const clonedStyle = styleElement.cloneNode(true) as HTMLElement;
      this.frameDocument!.head.appendChild(clonedStyle);
    });
  }

  protected startWatcher(): void {
    this.watcherInterval = window.setInterval(() => {
      this.checkAndRenderDocument();
    }, 10) as any;

    console.log(`[Frame ${this.config.id}] Document-Watcher gestartet (500ms Interval)`);
  }

  protected checkAndRenderDocument(): void {
    if(this.isRebuilding) {
      return;
    }

    if(!this.frameWindow || this.frameWindow.closed) {
      this.handleWindowClosed();
      return;
    }

    try {
      const currentDoc = this.frameWindow.document;
      const isNewDocument = (currentDoc !== this.frameDocument || !currentDoc.getElementById('app-root'));

      if(isNewDocument) {
        console.log(`[Frame ${this.config.id}] Document-Reset erkannt - Re-initialisiere...`);
        this.isRebuilding = true;

        if(this.componentRef) {
          try {
            this.appRef.detachView(this.componentRef.hostView);
            this.componentRef.destroy();
          } catch (e) {
            console.warn('Cleanup-Fehler (wird ignoriert):', e);
          }

          this.componentRef = null;
        }

        this.frameDocument = currentDoc;

        if (currentDoc.readyState === 'loading') {
          currentDoc.addEventListener('DOMContentLoaded', () => {
            this.setupInitialDocument();
            this.renderContent();
            this.isRebuilding = false;
          }, {
            once: true
          });
        } else {
          this.setupInitialDocument();
          this.renderContent();
          this.isRebuilding = false;
        }

        this.isDocumentInitialized = true;
      } else {
        const appRoot = currentDoc.getElementById('app-root');

        if(!appRoot || !currentDoc.body.contains(appRoot)) {
          console.log(`[Frame ${this.config.id}] app-root fehlt - Re-initialisiere...`);

          this.isRebuilding = true;
          this.setupInitialDocument();
          this.renderContent();
          this.isRebuilding = false;
        }
      }

    } catch (error) {
      console.warn(`[Frame ${this.config.id}] Document-Zugriff fehlgeschlagen:`, error);
      this.isRebuilding = false;
      this.handleWindowClosed();
    }
  }

  protected renderContent(): void {}

  protected renderComponent<T>(component: Type<T>, inputs?: Partial<T>): ComponentRef<T> | null {
    if (!this.frameDocument) {
      return null;
    }

    const appRoot = this.frameDocument.getElementById('app-root');

    if(!appRoot) {
      return null;
    }

    if(this.componentRef) {
      this.componentRef.destroy();
    }

    this.componentRef = createComponent(component, {
      environmentInjector: this.injector,
      hostElement: appRoot
    });

    if(inputs) {
      Object.assign(this.componentRef.instance, inputs);
      this.componentRef.changeDetectorRef.detectChanges();
    }

    this.appRef.attachView(this.componentRef.hostView);

    return this.componentRef as ComponentRef<T>;
  }

  protected setupCloseHandler(): void {
    if(!this.frameWindow) {
      return;
    }

    this.frameWindow.addEventListener('beforeunload', (event) => {
      console.log(`[Frame ${this.config.id}] beforeunload Event - User drückt F5 oder schließt Fenster`);
    });

    this.frameWindow.addEventListener('unload', () => {
      console.log(`[Frame ${this.config.id}] unload Event - Fenster wird geschlossen`);
    });

    this.frameWindow.addEventListener('pagehide', (event) => {
      if((event as PageTransitionEvent).persisted) {
        console.log(`[Frame ${this.config.id}] Page goes to back/forward cache`);
      } else {
        console.log(`[Frame ${this.config.id}] Page wird entladen`);
      }
    });
  }

  protected handleWindowClosed(): void {
    this.cleanup();
  }

  protected cleanup(): void {
    if(this.watcherInterval !== null) {
      clearInterval(this.watcherInterval);
      this.watcherInterval = null;
    }

    if(this.componentRef) {
      this.appRef.detachView(this.componentRef.hostView);
      this.componentRef.destroy();
      this.componentRef = null;
    }
  }

  public close(): void {
    this.cleanup();

    if(this.frameWindow && !this.frameWindow.closed) {
      this.frameWindow.close();
    }

    this.frameWindow = null;
    this.frameDocument = null;
  }

  public isOpen(): boolean {
    return this.frameWindow !== null && !this.frameWindow.closed;
  }

  public focus(): void {
    if(this.frameWindow && !this.frameWindow.closed) {
      this.frameWindow.focus();
    }
  }

  public getWindow(): Window | null {
    return this.frameWindow;
  }

  public getDocument(): Document | null {
    return this.frameDocument;
  }

  public getDebugInfo(): {
    id: string;
    isOpen: boolean;
    isRebuilding: boolean;
    documentExists: boolean;
    appRootExists: boolean;
    documentUrl: string;
    watcherActive: boolean;
  } {
    return {
      id: this.config.id,
      isOpen: this.isOpen(),
      isRebuilding: this.isRebuilding,
      documentExists: !!this.frameDocument,
      appRootExists: !!this.frameDocument?.getElementById('app-root'),
      documentUrl: this.frameDocument?.location.href || 'N/A',
      watcherActive: this.watcherInterval !== null
    };
  }
}
