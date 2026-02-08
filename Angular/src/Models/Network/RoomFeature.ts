import {Packet} from './Packet';

/**
 * @docs https://github.com/MeinChatserver/Documentation/blob/main/Protocol/Packets/ROOM_FEATURE.md
 **/
export class RoomFeature extends Packet {
  constructor(room: number | string | null = null) {
    super('ROOM_FEATURE', room);
  }
}
