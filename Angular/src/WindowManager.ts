/**
 * Mein Chatserver
 * ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
 * Licensed Materials - Property of mein-chatserver.de.
 * © Copyright 2024. All Rights Reserved.
 *
 * @version 2.0.0
 * @author  Adrian Preuß
 */
import { Injectable, ApplicationRef, EnvironmentInjector } from '@angular/core';
import { Frame } from './Frame';
import { PopupFrame, PopupConfig } from './PopupFrame';
import { ChatroomFrame } from './ChatroomFrame';
import { Client } from './Client';
import {Popup, WindowRoom } from './Models/Network';

@Injectable({
  providedIn: 'root'
})
export class WindowManager {
  private frames: Map<string, Frame> = new Map();

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) {}

  /*
  * Erstellt ein neues Popup-Fenster und registriert dies zeitgleich im WindowManager.
  *
  * @praram popup Popup
  * @return PopupFrame
  */
  createPopup(popup: Popup): PopupFrame {
    let config: PopupConfig = {
      id: popup.getName() ?? 'popup-' + Math.random().toString(36).substr(2, 9)
    };

    if(popup.hasTitle()) {
      config.title = popup.getTitle() ?? 'Neues Fenster';
    }

    if(popup.hasSize()) {
      const size = popup.getSize();

      if(size?.hasWidth()) {
        config.width = size?.getWidth() ?? 400;
      }

      if(size?.hasHeight()) {
        config.height = size?.getHeight() ?? 100;
      }
    }

    if(popup.hasElements()) {
      config.content = popup.getElements();
    }

    const frame = new PopupFrame(config, this.appRef, this.injector);
    this.addFrame(frame.getId(), frame);
    return frame;
  }

  /*
  * Erstellt ein neues Chatraum-Fenster und registriert dies zeitgleich im WindowManager.
  *
  * @praram packet WindowRoom
  * @praram client Client
  * @return ChatroomFrame
  */
  createChatroom(packet: WindowRoom, client: Client): ChatroomFrame {
    let config: PopupConfig = {
      id:     packet.getName() ?? 'chatroom-' + Math.random().toString(36).substr(2, 9),
      width:  800,
      height: 600
    };

    if(packet.hasTitle()) {
      config.title = packet.getTitle() ?? 'ChatroomFrame';
    }

    const chatroom = new ChatroomFrame(config, this.appRef, this.injector, client);
    this.addFrame(config.id, chatroom);
    return chatroom;
  }

  /*
  * Fügt ein neues Fenster zum WindowManager hinzu.
  *
  * @praram name string
  * @praram frame Frame
  */
  addFrame(name: string, frame: Frame): void {
    if(this.frames.has(name)) {
      console.warn(`Frame mit Name "${name}" existiert bereits und wird überschrieben.`);
      // @ToDo bad behavior!
    }

    this.frames.set(name, frame);
  }

  /*
  * Entfernt ein Fenster aus dem WindowManager.
  *
  * @praram name string
  * @return boolean
  */
  removeFrame(name: string): boolean {
    return this.frames.delete(name);
  }

  /*
  * Überprüft, ob ein Fenster im WindowManager existiert.
  *
  * @praram name string
  * @return boolean
  */
  existsFrame(name: string): boolean {
    return this.frames.has(name);
  }

  /*
  * Holt ein gespeichertes Fenster aus dem WindowManager.
  *
  * @praram name string
  * @return Frame | null
  */
  getFrame(name: string | null): Frame | null {
    if(!name) {
      return null;
    }

    const frame = this.frames.get(name);

    if(!frame) {
      return null;
    }

    return frame;
  }

  /*
  * Holt ein gespeichertes Popup-Fenster aus dem WindowManager.
  *
  * @praram name string
  * @return PopupFrame | null
  */
  getPopup(name: string | null): PopupFrame | null {
    if(!name) {
      return null;
    }

    const frame = this.frames.get(name);

    if(!(frame instanceof PopupFrame)) {
      return null;
    }

    return frame as PopupFrame;
  }

  /*
  * Holt ein gespeichertes Chatraum-Fenster aus dem WindowManager.
  *
  * @praram name string
  * @return ChatroomFrame | null
  */
  getChatroom(name: string | null): ChatroomFrame | null {
    if(!name) {
      return null;
    }

    const frame = this.frames.get(name);

    if(!(frame instanceof ChatroomFrame)) {
      return null;
    }

    return frame as ChatroomFrame;
  }

  /*
  * Holt alle gespeichertes Chatraum-Fenster aus dem WindowManager.
  *
  * @return ChatroomFrame[]
  */
  getAllChatrooms() {
    return Array.from(this.frames.values()).filter(frame => frame instanceof ChatroomFrame);
  }

  /*
  * Schließt alle Fenster im WindowManager.
  */
  closeAll(): void {
    this.frames.forEach(frame => frame.close());
    this.frames.clear();
  }

  /*
  * Holt alle Fensternamen aus dem WindowManager.
  *
  * @return string[]
  */
  getAllFrameNames(): string[] {
    return Array.from(this.frames.keys());
  }

  /*
  * Zählt alle Fensternamen im WindowManager.
  *
  * @return number
  */
  getFrameCount(): number {
    return this.frames.size;
  }
}
