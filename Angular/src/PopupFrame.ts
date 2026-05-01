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
      <div class="popup-wrapper">
        <div class="popup-body">
          ${html}
        </div>
        <div class="popup-footer">
          <div id="ok-btn" class="popup-footer-btn"></div>
        </div>
      </div>
      <style>
        .popup-wrapper {
          display: flex;
          flex-direction: column;
          height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .popup-body {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }
        .popup-label {
          display: block;
          font-weight: 600;
          font-size: 15px;
          color: #222;
          margin-bottom: 10px;
        }
        .popup-content {
          color: #555;
          line-height: 1.5;
          font-size: 14px;
        }
        .popup-footer {
          display: flex;
          justify-content: flex-end;
          padding: 10px 20px;
          border-top: 1px solid #e0e0e0;
          background: #f9f9f9;
        }
        .popup-footer-btn {
          min-width: 80px;
          height: 34px;
        }
      </style>
    `;
  }

  protected buildElement(element: any): string {
    switch(element.type) {
      case 'label':
        return `<label class="popup-label">${element.label ?? ''}</label>`;
      case 'content':
        return `<div class="popup-content">${element.content ?? ''}</div>`;
      default:
        return '';
    }
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
        <div class="form-group">
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
      <div class="popup-container">
        <h2>${config.title || 'Formular'}</h2>
        <form id="popup-form">
          ${fieldsHTML}
          <div class="form-actions">
            <button type="submit" class="btn-primary">
              ${config.submitLabel || 'Absenden'}
            </button>
            <button type="button" class="btn-secondary" id="cancel-btn">
              ${config.cancelLabel || 'Abbrechen'}
            </button>
          </div>
        </form>
      </div>
      <style>
        .popup-container {
          padding: 20px;
        }
        .popup-container h2 {
          margin-bottom: 20px;
          color: #333;
        }
        .form-group {
          margin-bottom: 15px;
        }
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #555;
        }
        .form-group input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        .form-group input:focus {
          outline: none;
          border-color: #0066cc;
        }
        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }
        .btn-primary, .btn-secondary {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }
        .btn-primary {
          background: #0066cc;
          color: white;
        }
        .btn-primary:hover {
          background: #0052a3;
        }
        .btn-secondary {
          background: #e0e0e0;
          color: #333;
        }
        .btn-secondary:hover {
          background: #d0d0d0;
        }
      </style>
    `;
  }

  protected buildMessage(config: any): string {
    return `
      <div class="popup-container message-container">
        ${config.icon ? `<div class="message-icon">${config.icon}</div>` : ''}
        <h2>${config.title || 'Nachricht'}</h2>
        <p>${config.message || ''}</p>
        <div class="form-actions">
          <button type="button" class="btn-primary" id="ok-btn">
            ${config.okLabel || 'OK'}
          </button>
        </div>
      </div>
      <style>
        .message-container {
          text-align: center;
          padding: 30px;
        }
        .message-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }
        .message-container h2 {
          margin-bottom: 15px;
          color: #333;
        }
        .message-container p {
          color: #666;
          margin-bottom: 25px;
          line-height: 1.5;
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
