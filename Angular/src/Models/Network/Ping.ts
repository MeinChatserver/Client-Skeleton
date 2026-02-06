import {Packet} from './Packet';

/**
 * Dieses Paket wird entweder vom Server oder auch vom Clienten versendet um zu überprüfen, ob die Verbindung noch besteht. Die Gegenseite muss innerhalb von 30 Sekunden mit einem PONG-Paket antworten, andernfalls wird die Verbindung mit einem DISCONNECT getrennt.
 *
 * @docs https://github.com/MeinChatserver/Documentation/blob/main/Protocol/Packets/PING.md
 **/
export class Ping extends Packet {
  constructor() {
    super('PING', null);
  }
}
