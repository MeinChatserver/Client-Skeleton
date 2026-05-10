import {Message} from './Message';

/**
 * Sendet im Chatraum ein Spiel eine Nachricht, wird dieses Paket an alle Ziel-Clienten, die im Raum sind, versendet.
 *
 * @docs https://github.com/MeinChatserver/Documentation/blob/main/Protocol/Packets/MESSAGE_GAME.md
 **/
export class MessageGame extends Message {
  constructor(data: any = null) {
    super(typeof data === 'string' ? { text: data } : data);
    this.setOperation('MESSAGE_GAME');
  }
}
