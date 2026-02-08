import {Message} from './Message';

/**
 * Passiert im Chatraum eine Aktion, wird dieses Paket an alle Ziel-Clienten, die im Raum sind, versendet.
 *
 * @docs https://github.com/MeinChatserver/Documentation/blob/main/Protocol/Packets/MESSAGE_ACTION.md
 **/
export class MessageAction extends Message {
  constructor(data: any = null) {
    super(data);
    this.setOperation('MESSAGE_ACTION');
  }
}
