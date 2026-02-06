import {Packet} from './Packet';

/**
 * Wird eine private Nachricht an den Nutzer versendet, wird dieses Paket an den Ziel-Clienten versendet.
 *
 * Achtung:
 * Die Parameter sender und users haben nur bei der Darstellung eine Relevanz.
 * Hat sender den Wert null, so ist dies eine Systemnachricht.
 *
 * @docs https://github.com/MeinChatserver/Documentation/blob/main/Protocol/Packets/MESSAGE_PRIVATE.md
 **/
export class MessagePrivate extends Packet {
  protected room: string | null = null;
  protected sender: string | null = null;
  protected users: string[] | null = null;
  protected text: string | null = null;

  constructor(data: any = null) {
    super('MESSAGE_PRIVATE', data);

    if(data.room) {
      this.room = data.room;
    }

    if(data.sender) {
      this.sender = data.sender;
    }

    if(data.users) {
      this.users = data.users;
    }

    if(data.text) {
      this.text = data.text;
    }
  }

  getRoom() {
    return this.room;
  }

  getSender() {
    return this.sender;
  }

  getUsers() {
    return this.users;
  }

  getText() {
    return this.text;
  }
}
