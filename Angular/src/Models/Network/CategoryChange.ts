import {Packet} from './Packet';

export class CategoryChange extends Packet {
  constructor(id: number | string | null = null) {
    super('CATEGORY_CHANGE', Number(id));
  }
}
