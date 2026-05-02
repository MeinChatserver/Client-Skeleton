import {Packet} from './Packet';

/**
 * @docs https://github.com/MeinChatserver/Documentation/blob/main/Protocol/Packets/ROOM_USER_FEATURE.md
 **/
export class RoomUserFeature extends Packet {
  protected room: string | null = null;
  protected name: string | null = null;
  protected reference: string | null = null;
  protected user: any | null = null; // @ToDo

  constructor(data: any = null) {
    super('ROOM_USER_FEATURE', data);

    if(data?.room) {
      this.room = data.room;
    }

    if(data?.name) {
      this.name = data.name;
    }

    if(data?.reference) {
      this.reference = data.reference;
    }

    if(data?.user) {
      this.user = data.user;
    }
  }

  getRoom(): string | null {
    return this.room;
  }

  getName(): string | null {
    return this.name;
  }

  getReference(): string | null {
    return this.reference;
  }

  getUser() {
    return this.user; // id, username, rank
  }
}
