import {Packet} from './Packet';
import {Room} from '../Room';

export class Rooms extends Packet {
  constructor(data: any) {
    super('ROOMS', data);
  }

  getRooms(): Room[] {
    return this.getData().map((room: any) => new Room(room));
  }
}
