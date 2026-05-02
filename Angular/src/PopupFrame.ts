import { ApplicationRef, ComponentRef, createComponent, EnvironmentInjector } from '@angular/core';
import { Frame, FrameConfig } from './Frame';
import { Button } from './Components';

export interface PopupConfig extends FrameConfig {
  content?: any;
  showCloseButton?: boolean;
}

export class PopupFrame extends Frame {
  protected content: any;
  protected eventListeners: Map<string, Function[]> = new Map();
  protected okButtonRef: ComponentRef<Button> | null = null;

  constructor(
    config: PopupConfig,
    appRef: ApplicationRef,
    injector: EnvironmentInjector
  ) {
    console.log('PopupFrame', config);
    super({
        ...config,
        width: config.width || 400,
        height: config.height || 100
      }, appRef, injector);

    this.content = config.content || {};
    this.renderContent();
  }

  protected override renderContent(): void {
    if (!this.frameDocument) {
      return;
    }

    const appRoot = this.frameDocument.querySelector('body');

    if(!appRoot) {
      return;
    }

    appRoot.innerHTML = this.buildContentFromJSON(this.content);

    this.renderOkButton();
    this.setupEventListeners();
  }

  protected buildContentFromJSON(content: any): string {
    if(typeof content === 'string') {
      return `<div class="popup-content">${content}</div>`;
    }

    if(Array.isArray(content)) {
      return this.buildFromElements(content);
    }

    if(content.type === 'form') {
      return this.buildForm(content);
    }

    if(content.type === 'message') {
      return this.buildMessage(content);
    }

    if(content.type === 'custom' && content.html) {
      return content.html;
    }

    return '<div>Kein Content definiert</div>';
  }

  protected buildFromElements(elements: any[]): string {
    const sorted = [...elements].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const html = sorted.map(el => this.buildElement(el)).join('');

    return `
      <div class="mcs-popup-wrapper">
        <div class="mcs-popup-body">
          ${html}
        </div>
        <div class="mcs-popup-footer">
          <div id="ok-btn" class="mcs-popup-footer-btn"></div>
        </div>
      </div>
      <style>
        .mcs-popup-wrapper {
          display: flex !important;
          flex-direction: column !important;
          height: 100vh !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .mcs-popup-body {
          flex: 1 !important;
          padding: 20px !important;
          overflow-y: auto !important;
        }
        .mcs-popup-label {
          display: block !important;
          font-weight: 600 !important;
          font-size: 15px !important;
          color: #222 !important;
          margin-bottom: 10px !important;
        }
        .mcs-popup-content {
          color: #555 !important;
          line-height: 1.5 !important;
          font-size: 14px !important;
        }
        .mcs-popup-footer {
          display: flex !important;
          justify-content: flex-end !important;
          padding: 10px 20px !important;
          border-top: 1px solid #e0e0e0 !important;
          background: #f9f9f9 !important;
          margin: 0 !important;
        }
        .mcs-popup-footer-btn {
          min-width: 80px !important;
          height: 34px !important;
        }
      </style>
    `;
  }

  protected buildElement(element: any): string {
    switch(element.type) {
      case 'label':
        return `<label class="mcs-popup-label">${element.label ?? ''}</label>`;
      case 'content':
        return `<div class="mcs-popup-content">${element.content ?? ''}</div>`;
      case 'split':
        return this.buildSplit(element);
      default:
        return '';
    }
  }

  protected buildSplit(split: any): string {
    const direction = split.direction || 'horizontal';
    const ratios: number[] = split.ratios || Array(split.splits).fill(100 / split.splits);
    const gap = split.gap || 10;

    const gridTemplateValue = direction === 'horizontal'
      ? `grid-template-columns: ${ratios.map((r: number) => `${r}fr`).join(' ')}`
      : `grid-template-rows: ${ratios.map((r: number) => `${r}fr`).join(' ')}`;

    const childrenHTML = (split.children || [])
      .map((childGroup: any[], index: number) => {
        const groupHTML = childGroup
          .map(child => this.buildElement(child))
          .join('');
        return `<div class="mcs-split-item">${groupHTML}</div>`;
      })
      .join('');

    return `
      <div class="mcs-split-container" style="${gridTemplateValue}; gap: ${gap}px;">
        ${childrenHTML}
      </div>
      <style>
        .mcs-split-container {
          display: grid !important;
          width: 100% !important;
        }
        .mcs-split-item {
          display: flex !important;
          flex-direction: column !important;
          gap: 10px !important;
        }
      </style>
    `;
  }

  protected renderOkButton(): void {
    if (!this.frameDocument) {
      return;
    }

    const slot = this.frameDocument.getElementById('ok-btn');

    if (!slot) {
      return;
    }

    if (this.okButtonRef) {
      this.appRef.detachView(this.okButtonRef.hostView);
      this.okButtonRef.destroy();
    }

    this.okButtonRef = createComponent(Button, {
      environmentInjector: this.injector,
      hostElement: slot
    });
    this.okButtonRef.instance.text = 'OK';
    this.okButtonRef.changeDetectorRef.detectChanges();
    this.appRef.attachView(this.okButtonRef.hostView);
  }

  protected override cleanup(): void {
    if (this.okButtonRef) {
      this.appRef.detachView(this.okButtonRef.hostView);
      this.okButtonRef.destroy();
      this.okButtonRef = null;
    }
    super.cleanup();
  }

  protected buildForm(config: any): string {
    const fields = config.fields || [];
    const fieldsHTML = fields.map((field: any) => {
      return `
        <div class="mcs-form-group">
          <label for="${field.id}">${field.label || field.id}</label>
          <input
            type="${field.type || 'text'}"
            id="${field.id}"
            name="${field.id}"
            placeholder="${field.placeholder || ''}"
            ${field.required ? 'required' : ''}
          />
        </div>
      `;
    }).join('');

    return `
      <div class="mcs-popup-container">
        <h2>${config.title || 'Formular'}</h2>
        <form id="popup-form">
          ${fieldsHTML}
          <div class="mcs-form-actions">
            <button type="submit" class="mcs-btn-primary">
              ${config.submitLabel || 'Absenden'}
            </button>
            <button type="button" class="mcs-btn-secondary" id="cancel-btn">
              ${config.cancelLabel || 'Abbrechen'}
            </button>
          </div>
        </form>
      </div>
      <style>
        .mcs-popup-container {
          padding: 20px !important;
        }
        .mcs-popup-container h2 {
          margin-bottom: 20px !important;
          color: #333 !important;
        }
        .mcs-form-group {
          margin-bottom: 15px !important;
        }
        .mcs-form-group label {
          display: block !important;
          margin-bottom: 5px !important;
          font-weight: 500 !important;
          color: #555 !important;
        }
        .mcs-form-group input {
          width: 100% !important;
          padding: 8px 12px !important;
          border: 1px solid #ddd !important;
          border-radius: 4px !important;
          font-size: 14px !important;
        }
        .mcs-form-group input:focus {
          outline: none !important;
          border-color: #0066cc !important;
        }
        .mcs-form-actions {
          display: flex !important;
          gap: 10px !important;
          margin-top: 20px !important;
        }
        .mcs-btn-primary, .mcs-btn-secondary {
          padding: 10px 20px !important;
          border: none !important;
          border-radius: 4px !important;
          cursor: pointer !important;
          font-size: 14px !important;
          font-weight: 500 !important;
        }
        .mcs-btn-primary {
          background: #0066cc !important;
          color: white !important;
        }
        .mcs-btn-primary:hover {
          background: #0052a3 !important;
        }
        .mcs-btn-secondary {
          background: #e0e0e0 !important;
          color: #333 !important;
        }
        .mcs-btn-secondary:hover {
          background: #d0d0d0 !important;
        }
      </style>
    `;
  }

  protected buildMessage(config: any): string {
    return `
      <div class="mcs-popup-container mcs-message-container">
        ${config.icon ? `<div class="mcs-message-icon">${config.icon}</div>` : ''}
        <h2>${config.title || 'Nachricht'}</h2>
        <p>${config.message || ''}</p>
        <div class="mcs-form-actions">
          <button type="button" class="mcs-btn-primary" id="ok-btn">
            ${config.okLabel || 'OK'}
          </button>
        </div>
      </div>
      <style>
        .mcs-message-container {
          text-align: center !important;
          padding: 30px !important;
        }
        .mcs-message-icon {
          font-size: 48px !important;
          margin-bottom: 20px !important;
        }
        .mcs-message-container h2 {
          margin-bottom: 15px !important;
          color: #333 !important;
        }
        .mcs-message-container p {
          color: #666 !important;
          margin-bottom: 25px !important;
          line-height: 1.5 !important;
        }
      </style>
    `;
  }

  protected setupEventListeners(): void {
    if (!this.frameDocument) {
      return;
    }

    const form = this.frameDocument.getElementById('popup-form');
    const okBtn = this.frameDocument.getElementById('ok-btn');
    const cancelBtn = this.frameDocument.getElementById('cancel-btn');
    const inputs = this.frameDocument.querySelectorAll('input');

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFormSubmit(e as Event);
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.emit('cancel');
        this.close();
      });
    }

    if (okBtn) {
      okBtn.addEventListener('click', () => {
        this.emit('ok');
        this.close();
      });
    }

    inputs.forEach(input => {
      input.addEventListener('input', (e) => {
        this.handleInputChange(e as Event);
      });
    });
  }

  protected handleFormSubmit(event: Event): void {
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const data: any = {};

    formData.forEach((value, key) => {
      data[key] = value;
    });

    this.emit('submit', data);
  }

  protected handleInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.emit('input-change', {
      id: input.id,
      value: input.value
    });
  }

  public on(eventName: string, callback: Function): void {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }

    this.eventListeners.get(eventName)!.push(callback);
  }

  public off(eventName: string, callback?: Function): void {
    if (!callback) {
      this.eventListeners.delete(eventName);
      return;
    }

    const listeners = this.eventListeners.get(eventName);

    if (listeners) {
      const index = listeners.indexOf(callback);

      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  protected emit(eventName: string, data?: any): void {
    const listeners = this.eventListeners.get(eventName);

    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  public updateContent(newContent: any): void {
    this.content = newContent;
    this.renderContent();
  }

  public setInputValue(inputId: string, value: string): void {
    if(!this.frameDocument) {
      return;
    }

    const input = this.frameDocument.getElementById(inputId) as HTMLInputElement;

    if (input) {
      input.value = value;
    }
  }

  public getInputValue(inputId: string): string | null {
    if (!this.frameDocument) {
      return null;
    }

    const input = this.frameDocument.getElementById(inputId) as HTMLInputElement;

    return input ? input.value : null;
  }
}
