import {Packet} from './Packet';

/**
 * Dieses Packet wird vom Clienten an den Server gesendet, wenn ein Chatraum-Fenster geschlossen wird.
 *
 * @docs https://github.com/MeinChatserver/Documentation/blob/main/Protocol/Packets/WINDOW_CLOSE.md
 **/
export class WindowClose extends Packet {
  constructor(name: string | null = null) {
    super('WINDOW_CLOSE', name);
  }

  getName(): string | null {
    return this.getData();
  }
}
