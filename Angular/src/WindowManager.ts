import { Injectable, ApplicationRef, EnvironmentInjector } from '@angular/core';
import { Frame } from './Frame';
import { PopupFrame, PopupConfig } from './PopupFrame';
import { ChatroomFrame } from './ChatroomFrame';
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
      // @ToDo
    }

    const frame = new PopupFrame(config, this.appRef, this.injector);
    this.addFrame(frame.getId(), frame);
    return frame;
  }

  createChatroom(packet: WindowRoom): ChatroomFrame {
    let config: PopupConfig = {
      id: packet.getName() ?? 'chatroom-' + Math.random().toString(36).substr(2, 9),
      width: 800,
      height: 600
    };

    if(packet.hasTitle()) {
      config.title = packet.getTitle() ?? 'ChatroomFrame';
    }

    const chatroom = new ChatroomFrame(config, this.appRef, this.injector);
    this.addFrame(config.id, chatroom);
    return chatroom;
  }

  addFrame(name: string, frame: Frame): void {
    if (this.frames.has(name)) {
      console.warn(`Frame mit Name "${name}" existiert bereits und wird überschrieben.`);
      // @ToDo bad behavior!
    }

    this.frames.set(name, frame);
  }

  removeFrame(name: string): boolean {
    return this.frames.delete(name);
  }

  existsFrame(name: string): boolean {
    return this.frames.has(name);
  }

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

  getAllChatrooms() {
    return Array.from(this.frames.values()).filter(frame => frame instanceof ChatroomFrame);
  }

  closeAll(): void {
    this.frames.forEach(frame => frame.close());
    this.frames.clear();
  }

  getAllFrameNames(): string[] {
    return Array.from(this.frames.keys());
  }

  getFrameCount(): number {
    return this.frames.size;
  }
}
