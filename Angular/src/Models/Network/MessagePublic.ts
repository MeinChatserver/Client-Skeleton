import {Packet} from './Packet';

/**
 * Wird eine Nachricht im Chatraum versendet, wird dieses Paket an alle Ziel-Clienten, die im Raum sind, versendet.
 *
 * Achtung:
 * Hat sender den Wert null, so ist dies eine Systemnachricht.
 *
 * @docs https://github.com/MeinChatserver/Documentation/blob/main/Protocol/Packets/MESSAGE_PUBLIC.md
 **/
export class MessagePublic extends Packet {
  protected room: string | null = null;
  protected sender: string | null = null;
  protected text: string | null = null;

  constructor(data: any = null) {
    super('MESSAGE_PUBLIC', data);

    if(data.room) {
      this.room = data.room;
    }

    if(data.sender) {
      this.sender = data.sender;
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

  isSystemMessage() {
    return (this.sender === null);
  }

  getText() {
    return this.text;
  }
}
