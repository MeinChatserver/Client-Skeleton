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
import { ListItem, Room, User } from './Models';

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
      <ui-list [items]="userItems()"></ui-list>
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
  users = signal<User[]>([]);
  private pendingScroll = false;

  userItems = computed((): ListItem[] =>
    this.users().map(user => ({ label: user.username, count: 0 }))
  );

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

  setUsers(users: User[]): void {
    this.users.set([...users]);
  }

  addUser(user: User): void {
    this.users.update(users => {
      if (users.some(u => u.id === user.id)) return users;
      return [...users, user];
    });
  }

  removeUser(user: User): void {
    this.users.update(users => users.filter(u => u.id !== user.id));
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
