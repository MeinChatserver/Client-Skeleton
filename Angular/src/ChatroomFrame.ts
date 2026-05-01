import { ApplicationRef, ComponentRef, EnvironmentInjector } from '@angular/core';
import { Frame, FrameConfig } from './Frame';
import { ChatroomComponent} from './ChatroomComponent';
import { Client } from './Client';
import { ChatMessage, ChatMessageType } from './ChatMessage';
export { ChatMessage, ChatMessageType } from './ChatMessage';

export interface ChatroomConfig extends FrameConfig {
  roomName?: string;
  username?: string;
}


export const CHATROOM_STYLES = `
  body {
    cursor: default;
    display: flex;
    flex-direction: row;
    background-color: var(--room-background);
    color: var(--room-foreground);
    padding: 0;
    overflow: hidden;
  }

  main {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  main ui-output {
    position: relative;
    display: flex;
    flex: 1;
    z-index: 0;
    min-height: 0;
    border-top: 1px solid #808080;
    border-left: 1px solid #808080;
    background-image: var(--room-background-image);
  }

  main ui-output canvas {
    z-index: -1;
    position: absolute;
    width: 100%;
    display: block;
    height: 100%;
    order: 0;
    user-select: none;
  }

  main ui-output ui-messages {
    position: relative;
    flex: 1;
    min-height: 0;
    z-index: 100;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: scroll;
  }

  main ui-output ui-messages ui-text {
    padding: 0 5px;
  }

  main ui-output ui-messages ui-text[data-type="action"] {
    color: var(--room-blue);
  }

  main ui-output ui-messages ui-text[data-type="public"] a.sender {
    font-weight: bold;
  }

  main ui-output ui-messages ui-text[data-type="private"] a.sender {
    font-weight: bold;
    color: var(--room-red);
  }

  main ui-input {
    flex: 0;
  }

  main ui-input input {
    width: 100%;
    height: 100%;
    font-size: 90%;
    padding: 5px 5px;
  }

  aside {
    position: relative;
    flex: 0 200px;
    border-top: 1px solid #808080;
    border-left: 1px solid #808080;
    display: flex;
    flex-direction: column;
  }

  aside ui-list {
    position: relative;
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    overflow-x: hidden;
    overflow-y: scroll;
  }

  aside ui-list::after {
    content: "";
    position: sticky;
    display: block;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    margin-top: -101%;
    width: 100%;
    height: 100%;
    pointer-events: none;
    border-top: 1px solid #000000;
    border-left: 1px solid #000000;
    overflow: hidden;
  }

  aside ui-list ui-entry {
    padding: 2px 6px;
  }

  aside ui-list ui-entry:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  aside ui-list ui-entry[data-active="true"],
  aside ui-list ui-entry:active,
  aside ui-list ui-entry:focus {
    background: rgba(0, 0, 128, 0.8);
    color: #FFFFFF;
  }

  aside ui-select {
    font-size: 16px;
    padding: 4px;
    background-color: var(--room-background);
    color: var(--room-foreground);
  }

  aside .connecting {
    text-align: center;
    padding: 10px;
  }
`;


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
