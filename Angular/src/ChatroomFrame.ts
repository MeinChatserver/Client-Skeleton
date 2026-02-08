import { ApplicationRef, EnvironmentInjector } from '@angular/core';
import { Frame, FrameConfig } from './Frame';

export interface ChatroomConfig extends FrameConfig {
  roomName?: string;
  username?: string;
}

export interface ChatMessage {
  username: string;
  message: string;
  timestamp?: Date;
}

export class ChatroomFrame extends Frame {
  protected roomName: string;
  protected messages: ChatMessage[] = [];
  protected eventListeners: Map<string, Function[]> = new Map();

  constructor(
    config: ChatroomConfig,
    appRef: ApplicationRef,
    injector: EnvironmentInjector
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
    this.emit('init', null);
  }

  protected override renderContent(): void {
    if(!this.frameDocument) {
      return;
    }

    const appRoot = this.frameDocument.querySelector('#app-root');

    if(!appRoot) {
      return;
    }

    appRoot.innerHTML = this.buildChatroomHTML();
    this.setupEventListeners();
    this.renderMessages();
  }

  protected buildChatroomHTML(): string {
    return `<ui-loading class="hidden"></ui-loading>
            <main>
              <ui-output data-position="CENTERED">
                <ui-messages></ui-messages>
                <canvas width="969" height="651" style="width: 100%; height: 100%;"></canvas></ui-output>
                <ui-input>
                    <input type="text" name="message" id="message-input" autocomplete="off"placeholder="Gebe eine Nachricht ein...">
                </ui-input>
            </main>
            <aside>
              <ui-list></ui-list>
              <select></select>
            </aside>
            <style>
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
                padding: 0px 5px;
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

              aside select {
                font-size: 16px;
                padding: 4px;
                background-color: var(--room-background);
                color: var(--room-foreground);
              }
            </style>`;
  }

  protected setupEventListeners(): void {
    if(!this.frameDocument) {
      return;
    }

    const messageInput = this.frameDocument.querySelector('main ui-input input') as HTMLInputElement;

    if (messageInput) {
      messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();

          this.emit('sendMessage', messageInput.value);
        }
      });
    }
  }

  public addMessage(message: ChatMessage): void {
    this.messages.push(message);

    this.renderMessages();
    this.scrollToBottom();
  }

  protected renderMessages(): void {
    if (!this.frameDocument) {
      return;
    }

    const messagesContainer = this.frameDocument.querySelector('ui-output ui-messages');

    if (!messagesContainer) {
      return;
    }

    messagesContainer.innerHTML = this.messages.map(msg =>
      this.buildMessageHTML(msg)
    ).join('');
  }

  protected buildMessageHTML(message: ChatMessage): string {
    return `<ui-text>
            ${message}
        </ui-text>`;
  }

  protected scrollToBottom(): void {
    if(!this.frameDocument) {
      return;
    }

    const messagesContainer = this.frameDocument.querySelector('ui-output ui-messages');

    if(messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  public on(eventName: string, callback: Function): void {
    if(!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }

    this.eventListeners.get(eventName)!.push(callback);
  }

  public off(eventName: string, callback?: Function): void {
    if(!callback) {
      this.eventListeners.delete(eventName);
      return;
    }

    const listeners = this.eventListeners.get(eventName);

    if(listeners) {
      const index = listeners.indexOf(callback);

      if(index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  protected emit(eventName: string, data?: any): void {
    const listeners = this.eventListeners.get(eventName);

    if(listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  public clearMessages(): void {
    this.messages = [];
    this.renderMessages();
    this.emit('messages-cleared');
  }
}
