import { User } from './Models';

export enum ChatMessageType {
  ACTION = 'ACTION',
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE'
}

export class ChatMessage {
  user: User | null | '-' = null;
  users?: User[] | null   = null;
  type: ChatMessageType   = ChatMessageType.PUBLIC;
  message: string | null  = null;
  timestamp?: Date;

  constructor(init?: Partial<ChatMessage>) {
    Object.assign(this, init);
  }

  getUsername(): string {
    if(this.user === null || this.user === '-') {
      return 'System';
    }

    if(this.user) {
      return `<span data-action="profile:${this.user.username}">${this.user.username}</span>`;
    }

    return '';
  }
}
