import { ApplicationRef, ComponentRef, EnvironmentInjector } from '@angular/core';
import { Frame, FrameConfig } from './Frame';
import { ChatMessage, ChatMessageType } from './ChatMessage';
import { ChatroomComponent, CHATROOM_STYLES } from './ChatroomComponent';
import { Client } from './Client';

export { ChatMessage, ChatMessageType } from './ChatMessage';

export interface ChatroomConfig extends FrameConfig {
  roomName?: string;
  username?: string;
}

export class ChatroomFrame extends Frame {
  protected roomName: string;
  protected messages: ChatMessage[] = [];
  protected eventListeners: Map<string, Function[]> = new Map();

  constructor(
    config: ChatroomConfig,
    appRef: ApplicationRef,
    injector: EnvironmentInjector,
    protected client: Client
  ) {
    super(
      {
        ...config,
        width: config.width || 800,
        height: config.height || 600,
        resizable: true,
        scrollbars: false
      },
      appRef,
      injector
    );

    this.roomName = config.roomName || 'Chat';

    this.renderContent();
  }

  protected override renderContent(): void {
    if (this.frameDocument && !this.frameDocument.getElementById('chatroom-styles')) {
      const style = this.frameDocument.createElement('style');
      style.id = 'chatroom-styles';
      style.textContent = CHATROOM_STYLES;
      this.frameDocument.head.appendChild(style);
    }

    const ref = this.renderComponent(ChatroomComponent, {
      client: this.client,
      roomName: this.roomName
    }) as ComponentRef<ChatroomComponent> | null;

    if (!ref) {
      return;
    }

    const instance = ref.instance as ChatroomComponent;

    instance.initMessages(this.messages);
    instance.sendMessage.subscribe((msg: string) => this.emit('sendMessage', msg));
    instance.chatroomSelect.subscribe(({ type, item }: { type: string; item: any }) =>
      this.emit('chatroomSelect', { type, item })
    );

    ref.changeDetectorRef.detectChanges();
  }

  public addMessage(message: ChatMessage): void {
    this.messages.push(message);

    if (this.componentRef) {
      (this.componentRef.instance as ChatroomComponent).addMessage(message);
    }
  }

  public clearMessages(): void {
    this.messages = [];

    if (this.componentRef) {
      (this.componentRef.instance as ChatroomComponent).clearMessages();
    }

    this.emit('messages-cleared');
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
}
