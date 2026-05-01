import {Message} from './Message';
import {User} from '../User';

/**
 * Wird eine private Nachricht an den Nutzer versendet, wird dieses Paket an den Ziel-Clienten versendet.
 *
 * Achtung:
 * Die Parameter sender und users haben nur bei der Darstellung eine Relevanz.
 * Hat sender den Wert null, so ist dies eine Systemnachricht.
 *
 * @docs https://github.com/MeinChatserver/Documentation/blob/main/Protocol/Packets/MESSAGE_PRIVATE.md
 **/
export class MessagePrivate extends Message {
  protected sender: string | null = null;
  protected users: User[] | null = null;

  constructor(data: any = null) {
    super(data);
    this.setOperation('MESSAGE_PRIVATE');

    if(data.sender) {
      this.sender = data.sender;
    }

    if(data.users) {
      this.users = data.users as User[];
    }
  }

  getSender() {
    return this.sender;
  }

  getUsers() {
    return this.users;
  }
}
