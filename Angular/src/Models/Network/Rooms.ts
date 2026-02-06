import {Packet} from './Packet';
import {Room} from '../Room';

/**
 * Dieses Paket wird nach einem (HANDSHAKE)(HANDSHAKE.md) automatisch an den Clienten oder nach Aufforderung von X gesendet.
 *
 * @docs https://github.com/MeinChatserver/Documentation/blob/main/Protocol/Packets/ROOMS.md
 **/
export class Rooms extends Packet {
  constructor(data: any) {
    super('ROOMS', data);
  }

  getRooms(): Room[] {
    return this.getData().map((room: any) => new Room(room));
  }
}
