import {Packet} from './Packet';

/**
 * @docs https://github.com/MeinChatserver/Documentation/blob/main/Protocol/Packets/ROOM_FEATURE.md
 **/
export class RoomFeature extends Packet {
  protected reference: string | null = null;
  protected name: string | null = null;

  constructor(data: any = null) {
    super('ROOM_FEATURE', data);

    if(data?.reference) {
      this.reference = data.reference;
    }

    if(data?.name) {
      this.name = data.name;
    }
  }

  getReference(): string | null {
    return this.reference;
  }

  getName(): string | null {
    return this.name;
  }
}
