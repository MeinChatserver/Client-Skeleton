import {Packet} from './Packet';

export class ChatroomInfo extends Packet {
  constructor(name: string | null = null) {
    super('ROOM_INFO', name);
  }
}
