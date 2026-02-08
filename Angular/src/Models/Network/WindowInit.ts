import {Packet} from './Packet';

/**
 * Dieses Paket wird nach empfangen des WINDOW_ROOM-Paketes sowie nach erfolgreichem Aufbau des Chatraum-Fensters verschickt.
 *
 * @docs https://github.com/MeinChatserver/Documentation/blob/main/Protocol/Packets/WINDOW_INIT.md
 **/
export class WindowInit extends Packet {
  constructor(data: any = null) {
    super('WINDOW_INIT', data);
  }

  getName() {
    return this.getData();
  }
}
