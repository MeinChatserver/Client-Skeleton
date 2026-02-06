import {Packet} from './Packet';

/**
 * Dieses Packet wird vom Clienten an den Server gesendet, wenn ein Chatraum-Fenster geschlossen wird.
 *
 * @docs https://github.com/MeinChatserver/Documentation/blob/main/Protocol/Packets/WINDOW_CLOSE.md
 **/
export class WindowClose extends Packet {
  protected name: string | null = null;

  constructor(data: any = null) {
    super('WINDOW_CLOSE', data);

    if(data) {
      this.name = data;
    }
  }

  getName() {
    return this.name;
  }
}
