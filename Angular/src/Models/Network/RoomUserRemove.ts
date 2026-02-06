import {Packet} from './Packet';

/**
 * Dieses Paket wird vom Chatserver versendet, wenn ein Nutzer einen Raum verlässt.
 *
 * @docs https://github.com/MeinChatserver/Documentation/blob/main/Protocol/Packets/ROOM_USER_REMOVE.md
 **/
export class RoomUserRemove extends Packet {
  protected room: string | null = null;
  protected user: any | null = null; // @ToDo

  constructor(data: any = null) {
    super('ROOM_USER_REMOVE', data);

    if(data.room) {
      this.room = data.room;
    }

    if(data.user) {
      this.user = data.user;
    }
  }

  getRoom() {
    return this.room;
  }

  getUser() {
    return this.user; // id, username, rank
  }
}
