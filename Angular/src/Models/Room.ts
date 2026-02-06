import {Category} from './Category';
import {RoomConfiguration} from './RoomConfiguration';
import {RoomStyle} from './RoomStyle';
import {User} from './User';

export class Room {
  category: Category | null = null;
  id: number | null = null;
  name: string | null = null;
  topic: string | null = null;
  configuration: RoomConfiguration | null = null;
  users: User[] = [];
  style: RoomStyle | null = null;

  constructor(data: any) {
    if(data.category) {
      this.category = data.category;
    }

    if(data.id) {
      this.id = data.id;
    }

    if(data.name) {
      this.name = data.name;
    }

    if(data.topic) {
      this.topic = data.topic;
    }

    if(data.configuration) {
      this.configuration = data.configuration;
    }

    if(data.users) {
      this.users = data.users as User[];
    }

    if(data.style) {
      this.style = data.style as RoomStyle;
    }
  }

  getCategory() {
    return this.category;
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name;
  }

  getTopic() {
    return this.topic;
  }

  getConfiguration() {
    return this.configuration;
  }

  getUserCount() {
    return this.users.length;
  }
}
