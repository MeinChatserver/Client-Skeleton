import {
  Component, Input, Output, EventEmitter,
  signal, computed, CUSTOM_ELEMENTS_SCHEMA,
  ViewEncapsulation, ViewChild, ElementRef,
  AfterViewChecked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatMessage, ChatMessageType } from './ChatMessage';
import { Client } from './Client';
import {List, Select, Textfield} from './Components';
import { ListItem, Room } from './Models';

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

@Component({
  selector: 'app-chatroom',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, List, Select, Textfield],
  template: `
    <ui-loading class="hidden"></ui-loading>
    <main>
      <ui-output data-position="CENTERED">
        <ui-messages #messagesContainer>
          @for (message of messages(); track $index) {
            <ui-text [attr.data-type]="getMessageType(message)" [innerHTML]="getMessageContent(message)"></ui-text>
          }
        </ui-messages>
        <canvas width="969" height="651" style="width: 100%; height: 100%;"></canvas>
      </ui-output>
      <ui-input>
        <input #messageInput type="text" name="message" id="message-input" autocomplete="off"
               placeholder="Gebe eine Nachricht ein..."
               (keydown.enter)="onSendMessage(messageInput)">
      </ui-input>
    </main>
    <aside>
      <ui-list></ui-list>
      <ui-select name="chatrooms" [options]="chatrooms()" valueKey="id" labelKey="name"></ui-select>
    </aside>
  `,
  styles: []
})
export class ChatroomComponent implements AfterViewChecked {
  @Input() client!: Client;
  @Input() roomName: string = '';
  @Output() sendMessage = new EventEmitter<string>();
  @Output() chatroomSelect = new EventEmitter<{ type: string; item: ListItem }>();

  @ViewChild('messagesContainer') messagesContainer?: ElementRef<HTMLElement>;

  messages = signal<ChatMessage[]>([]);
  private pendingScroll = false;

  chatrooms = computed(() => {
    if (!this.client) return [];
    return this.client.chatRooms()
      .filter(room => room.getName() !== null)
      .map(room => ({
        id: room.getName() ?? '',
        name: room.getName() ?? ''
      }));
  });

  ngAfterViewChecked(): void {
    if (this.pendingScroll && this.messagesContainer) {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.pendingScroll = false;
    }
  }

  initMessages(messages: ChatMessage[]): void {
    this.messages.set([...messages]);
    this.pendingScroll = true;
  }

  addMessage(message: ChatMessage): void {
    this.messages.update(msgs => [...msgs, message]);
    this.pendingScroll = true;
  }

  clearMessages(): void {
    this.messages.set([]);
  }

  onSendMessage(input: HTMLInputElement): void {
    const value = input.value.trim();
    if (value) {
      this.sendMessage.emit(value);
      input.value = '';
    }
  }

  onChatroomSelect(type: string, item: ListItem): void {
    this.chatroomSelect.emit({ type, item });
  }

  getMessageType(message: ChatMessage): string {
    return message.type.toLowerCase();
  }

  getMessageContent(message: ChatMessage): string {
    switch (message.type) {
      case ChatMessageType.ACTION:
        return message.message ?? '';
      case ChatMessageType.PUBLIC:
        return `${message.getUsername()}: ${message.message}`;
      case ChatMessageType.PRIVATE: {
        let target = '';
        if (message.user && message.users) {
          target = ' an ' + message.users.map(entry =>
            `<span data-action="profile:${entry.username}">${entry.username}</span>`
          ).join(', ');
        }
        return `${message.getUsername()} (privat${target}): ${message.message}`;
      }
    }
  }
}
