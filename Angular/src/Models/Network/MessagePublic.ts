import {Message} from './Message';

/**
 * Wird eine Nachricht im Chatraum versendet, wird dieses Paket an alle Ziel-Clienten, die im Raum sind, versendet.
 *
 * Achtung:
 * Hat sender den Wert null, so ist dies eine Systemnachricht.
 *
 * @docs https://github.com/MeinChatserver/Documentation/blob/main/Protocol/Packets/MESSAGE_PUBLIC.md
 **/
export class MessagePublic extends Message {
  protected sender: string | null = null;

  constructor(data: any = null) {
    super(data);
    this.setOperation('MESSAGE_PUBLIC');

    if(data.sender) {
      this.sender = data.sender;
    }
  }

  getSender() {
    return this.sender;
  }

  isSystemMessage() {
    return (this.sender === null);
  }
}
