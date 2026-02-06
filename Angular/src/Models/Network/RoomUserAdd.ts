import {Packet} from './Packet';

/**
 * Dieses Paket wird vom Chatserver versendet, wenn im Raum ein Nutzer beitritt.
 *
 * @docs https://github.com/MeinChatserver/Documentation/blob/main/Protocol/Packets/ROOM_USER_ADD.md
 **/
export class RoomUserAdd extends Packet {
  protected room: string | null = null;
  protected user: any | null = null; // @ToDo

  constructor(data: any = null) {
    super('ROOM_USER_ADD', data);

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
