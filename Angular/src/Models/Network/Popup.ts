import {Packet} from './Packet';
import {Component} from '@angular/core';
import {Size} from '../Size';

/**
 * Dieses Paket kann ein Popup am Clienten anzeigen.
 *
 * @docs https://github.com/MeinChatserver/Documentation/blob/main/Protocol/Packets/POPUP.md
 **/
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
}
