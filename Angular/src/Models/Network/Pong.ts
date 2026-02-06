import {Packet} from './Packet';

/**
 * Dieses Paket wird als Antwort vom Server oder auch vom Clienten versendet wenn ein PING-Paket empfangen wurde.
 * Diese Mechanik dient zur überprüfung, ob die Verbindung noch besteht. Die Gegenseite muss innerhalb von 30 Sekunden mit diesem Paket antworten, andernfalls wird die Verbindung mit einem DISCONNECT getrennt.
 *
 * @docs https://github.com/MeinChatserver/Documentation/blob/main/Protocol/Packets/PONG.md
 **/
export class Pong extends Packet {
  constructor() {
    super('PONG', null);
  }
}
