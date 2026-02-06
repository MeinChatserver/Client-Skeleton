import {Packet} from './Packet';

/**
 * Dieses Paket wird entweder vom Clienten als auch vom Server als Benachrichtigung zu einem Disconnect versendet und beendet die Verbindung.
 *
 * @docs https://github.com/MeinChatserver/Documentation/blob/main/Protocol/Packets/DISCONNECT.md
 **/
export class Disconnect extends Packet {
  constructor() {
    super('DISCONNECT', null);
  }
}
