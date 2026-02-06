import {Packet} from './Packet';

/**
 * Passiert im Chatraum eine Aktion, wird dieses Paket an alle Ziel-Clienten, die im Raum sind, versendet.
 *
 * @docs https://github.com/MeinChatserver/Documentation/blob/main/Protocol/Packets/MESSAGE_ACTION.md
 **/
export class MessageAction extends Packet {
  protected room: string | null = null;
  protected text: string | null = null;

  constructor(data: any = null) {
    super('MESSAGE_ACTION', data);

    if(data.room) {
      this.room = data.room;
    }

    if(data.text) {
      this.text = data.text;
    }
  }

  getRoom() {
    return this.room;
  }

  getText() {
    return this.text;
  }
}
