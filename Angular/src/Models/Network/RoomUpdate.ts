import {Packet} from './Packet';
import {Category} from '../Category';
import {RoomStyle} from '../RoomStyle';

/**
 * Wird ein Chatraum verändert, wird dies dem Clienten direkt mitgeteilt.
 *
 * @docs https://github.com/MeinChatserver/Documentation/blob/main/Protocol/Packets/ROOM_UPDATE.md
 **/
export class RoomUpdate extends Packet {
  protected id: number | null = null;
  protected name: string | null = null;
  protected category: Category | null = null;
  protected style: any | null = null; // @ToDo
  protected users: any | null = null; // @ToDo

  constructor(data: any = null) {
    super('ROOM_UPDATE', data);

    if(data.id) {
      this.id = data.id;
    }

    if(data.name) {
      this.name = data.name;
    }

    if(data.category) {
      this.category = new Category(data.category);
    }

    if(data.style) {
      this.style = data.style instanceof RoomStyle ? data.style : new RoomStyle(data.style);
    }

    if(data.users) {
      this.users = data.users;
    }
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name;
  }

  hasCategory() {
    return (this.category !== null);
  }

  getCategory() {
    return this.category;
  }

  getStyle() {
    return this.style;
  }

  getUsers() {
    return this.users;
  }
}
