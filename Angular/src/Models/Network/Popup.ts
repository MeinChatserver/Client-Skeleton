import {Packet} from './Packet';
import {Component} from '@angular/core';
import {Size} from '../Size';

export class Popup extends Packet {
  private name: string | null = null;
  private title: string | null = null;
  private size: Size | null = null;
  private elements: Component[] = [];

  constructor(data: any) {
    super('POPUP', data);

    if(data.width || data.height) {
      this.size = new Size(data.width, data.height);
    }

    if(data.name) {
      this.name = data.name;
    }

    if(data.title) {
      this.title = data.title;
    }

    if(data.elements) {
      this.elements = data.elements;
    }
  }

  hasName() {
    return this.name !== null;
  }

  getName(): string | null {
    return this.name;
  }

  hasSize() {
    return this.size !== null;
  }

  getSize(): Size | null {
    return this.size;
  }

  hasTitle() {
    return this.title !== null;
  }

  getTitle(): string | null {
    return this.title;
  }

  hasElements() {
    return this.elements.length > 0;
  }

  getElements(): Component[] {
    return this.elements;
  }

  /**
   * Rendert die Popup-Elements zu HTML
   */
  render(): string {
    if (!this.hasElements()) {
      return '<html><body><p>Kein Inhalt</p></body></html>';
    }

    // Sortiere nach order
    const sortedElements = [...this.elements].sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

    let bodyContent = '';

    sortedElements.forEach((element: any) => {
      switch (element.type) {
        case 'label':
          bodyContent += `<h2>${this.escapeHtml(element.label || '')}</h2>`;
          break;
        case 'content':
          bodyContent += `<p>${this.escapeHtml(element.content || '')}</p>`;
          break;
        case 'button':
          bodyContent += `<button>${this.escapeHtml(element.label || element.name || 'Button')}</button>`;
          break;
        case 'input':
          bodyContent += `<input type="text" placeholder="${this.escapeHtml(element.label || '')}" />`;
          break;
        case 'textarea':
          bodyContent += `<textarea placeholder="${this.escapeHtml(element.label || '')}">${this.escapeHtml(element.content || '')}</textarea>`;
          break;
        case 'component':
          // Für Angular Components - hier könnte später die Component gerendert werden
          bodyContent += `<div data-component="${this.escapeHtml(element.name || '')}">Angular Component: ${this.escapeHtml(element.name || 'Unknown')}</div>`;
          break;
        default:
          // Fallback für unbekannte Typen
          bodyContent += `<div>${this.escapeHtml(JSON.stringify(element))}</div>`;
      }
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${this.escapeHtml(this.title || 'Popup')}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            margin: 0;
            background: #f5f5f5;
          }
          h2 {
            color: #333;
            margin: 0 0 15px 0;
            font-size: 18px;
            font-weight: 600;
          }
          p {
            color: #666;
            line-height: 1.6;
            margin: 0 0 15px 0;
          }
          button {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            margin: 5px 5px 5px 0;
          }
          button:hover {
            background: #0056b3;
          }
          input, textarea {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            box-sizing: border-box;
            margin-bottom: 10px;
          }
          textarea {
            min-height: 100px;
            resize: vertical;
          }
          [data-component] {
            padding: 15px;
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        ${bodyContent}
      </body>
      </html>
    `;
  }

  /**
   * Escaped HTML um XSS zu vermeiden
   */
  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}
