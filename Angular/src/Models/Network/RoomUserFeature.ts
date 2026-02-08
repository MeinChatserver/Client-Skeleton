import {Packet} from './Packet';

/**
 * @docs https://github.com/MeinChatserver/Documentation/blob/main/Protocol/Packets/ROOM_USER_FEATURE.md
 **/
export class RoomUserFeature extends Packet {
  protected room: string | null = null;
  protected user: any | null = null; // @ToDo

  constructor(data: any = null) {
    super('ROOM_USER_FEATURE', data);

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
