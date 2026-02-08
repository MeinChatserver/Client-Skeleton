import { Injectable, ApplicationRef, EnvironmentInjector } from '@angular/core';
import { Frame } from './Frame';
import { PopupFrame, PopupConfig } from './PopupFrame';
import { Chatroom, ChatroomConfig } from './Chatroom';
import {Popup} from './Models/Network/Popup';

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

  createChatroom(config: ChatroomConfig): Chatroom {
    const chatroom = new Chatroom(config, this.appRef, this.injector);
    this.addFrame(config.id, chatroom);
    return chatroom;
  }

  addFrame(id: string, frame: Frame): void {
    if (this.frames.has(id)) {
      console.warn(`Frame mit ID "${id}" existiert bereits und wird überschrieben.`);
      // @ToDo bad behavior!
    }

    this.frames.set(id, frame);
  }

  removeFrame(id: string): boolean {
    return this.frames.delete(id);
  }

  existsFrame(id: string): boolean {
    return this.frames.has(id);
  }

  getFrame(id: string): Frame | undefined {
    return this.frames.get(id);
  }

  getPopup(id: string): Popup | undefined {
    const frame = this.frames.get(id);
    return frame instanceof Popup ? frame : undefined;
  }

  getChatroom(id: string): Chatroom | undefined {
    const frame = this.frames.get(id);
    return frame instanceof Chatroom ? frame : undefined;
  }

  closeAll(): void {
    this.frames.forEach(frame => frame.close());
    this.frames.clear();
  }

  getAllFrameIds(): string[] {
    return Array.from(this.frames.keys());
  }

  getFrameCount(): number {
    return this.frames.size;
  }
}
