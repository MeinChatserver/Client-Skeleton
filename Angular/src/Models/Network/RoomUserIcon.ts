import {Packet} from './Packet';
import {Icon} from '../Icon';
import {User} from '../User';

/**
 * @docs https://github.com/MeinChatserver/Documentation/blob/main/Protocol/Packets/ROOM_USER_ICON.md
 **/
export class RoomUserIcon extends Packet {
  protected room: string | null = null;
  protected user: User | null = null;
  protected icon: Icon | null = null;
  protected type: string | null = null;

  constructor(data: any = null) {
    super('ROOM_USER_ICON', data);

    if(data?.room) {
      this.room = data.room;
    }

    if(data?.user) {
      this.user = data.user;
    }

    if(data?.type) {
      this.type = data.type;
    }

    if(data?.icon) {
      this.icon = new Icon(data.icon.path ?? null, data.icon.position ?? null);
    }
  }

  getRoom(): string | null {
    return this.room;
  }

  getUser(): User | null {
    return this.user;
  }

  getType(): string | null {
    return this.type;
  }

  getIcon(): Icon | null {
    return this.icon;
  }
}
