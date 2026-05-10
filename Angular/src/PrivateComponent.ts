import {
  AfterViewChecked,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MessageInput } from './Components';
import { Client } from './Client';
import { ChatMessage, ChatMessageType } from './ChatMessage';
import { PrivateFrame } from './PrivateFrame';

export const PRIVATE_STYLES = `
  body {
    margin: 0;
    padding: 0;
    height: 100%;
    overflow: hidden;
  }

  body main {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  body main ui-output {
    flex: 1;
    overflow: hidden;
    background: var(--room-background, #FFFFFF);
    color: var(--room-foreground, #000000);
    display: flex;
    flex-direction: column;
    position: relative;
  }

  body main ui-output ui-messages {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  body main ui-output ui-messages ui-text {
    display: block;
    line-height: 1.4;
    word-wrap: break-word;
  }

  body main ui-output ui-messages ui-text[data-type="action"] {
    font-style: italic;
    color: var(--room-blue, #888);
  }

  body main ui-output ui-messages ui-text[data-type="private"] .sender,
  body main ui-output ui-messages ui-text[data-type="public"] .sender {
    font-weight: bold;
  }
`;

@Component({
  selector: 'private-component',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, MessageInput, FormsModule],
  template: `
    <main>
      <ui-output>
        <ui-messages #messagesContainer>
          @for (message of messages(); track $index) {
            <ui-text [attr.data-type]="getMessageType(message)" [innerHTML]="getMessageContent(message)"></ui-text>
          }
        </ui-messages>
      </ui-output>
      <ui-message-input #messageInput [placeholder]="'Gebe eine Nachricht ein...'" (keydown.enter)="onSendMessage()"></ui-message-input>
    </main>
  `,
  styles: []
})
export class PrivateComponent implements AfterViewChecked {
  @Input() client!: Client;
  @Input() frame!: PrivateFrame;
  @Output() sendMessage = new EventEmitter<string>();

  @ViewChild('messagesContainer') messagesContainer?: ElementRef<HTMLElement>;
  @ViewChild('messageInput') messageInput?: any;

  messages = signal<ChatMessage[]>([]);
  private sanitizer = inject(DomSanitizer);
  private pendingScroll = false;

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

  onSendMessage(): void {
    if(!this.messageInput) {
      return;
    }

    const value = this.messageInput.getValue().trim();

    if(value) {
      this.sendMessage.emit(value);
      (this.messageInput as any).sendMessage();
    }
  }

  ngAfterViewChecked(): void {
    if(this.pendingScroll && this.messagesContainer) {
      const el = this.messagesContainer.nativeElement;
      const win = el.ownerDocument.defaultView || window;

      this.pendingScroll = false;
      win.requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }

  getMessageType(message: ChatMessage): string {
    return message.type.toLowerCase();
  }

  getMessageContent(message: ChatMessage): SafeHtml {
    let html: string;

    switch(message.type) {
      case ChatMessageType.ACTION:
        html = message.message ?? '';
        break;
      case ChatMessageType.PUBLIC:
      case ChatMessageType.PRIVATE:
        html = `<span class="sender">${message.getUsername()}:</span> ${message.message}`;
        break;
      default:
        html = message.message ?? '';
    }

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
