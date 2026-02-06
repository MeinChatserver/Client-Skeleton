import {Packet} from './Packet';

/**
 * Dieses Packet wird zum Server gesendet, wenn eine Raum-Info aufgerufen/geöffnet werden soll.
 *
 * @docs https://github.com/MeinChatserver/Documentation/blob/main/Protocol/Packets/ROOM_INFO.md
 **/
export class RoomInfo extends Packet {
  constructor(room: number | string | null = null) {
    super('ROOM_INFO', room);
  }
}
