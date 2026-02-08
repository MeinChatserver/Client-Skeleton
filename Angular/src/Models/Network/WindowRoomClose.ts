import {Packet} from './Packet';

/**
 * @docs https://github.com/MeinChatserver/Documentation/blob/main/Protocol/Packets/WINDOW_ROOM_CLOSE.md
 **/
export class WindowRoomClose extends Packet {
  protected name: string | null = null;

  constructor(data: any = null) {
    super('WINDOW_ROOM_CLOSE', data);

    if(data) {
      this.name = data;
    }
  }

  getName() {
    return this.name;
  }
}
