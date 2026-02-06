import {Packet} from './Packet';

/**
 * @docs https://github.com/MeinChatserver/Documentation/blob/main/Protocol/Packets/CATEGORY_CHANGE.md
 **/
export class CategoryChange extends Packet {
  constructor(id: number | string | null = null) {
    super('CATEGORY_CHANGE', Number(id));
  }
}
