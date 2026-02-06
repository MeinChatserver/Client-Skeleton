import {Packet} from './Packet';

/**
 * Dieses Paket wird nach empfangen des WINDOW_ROOM-Paketes sowie nach erfolgreichem Aufbau des Chatraum-Fensters verschickt.
 *
 * @docs https://github.com/MeinChatserver/Documentation/blob/main/Protocol/Packets/WINDOW_INIT.md
 **/
export class WindowInit extends Packet {
  protected name: string | null = null;

  constructor(data: any = null) {
    super('WINDOW_INIT', data);

    if(data) {
      this.name = data;
    }
  }

  getName() {
    return this.name;
  }
}
