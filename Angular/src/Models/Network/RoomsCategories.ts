import {Packet} from './Packet';
import {Category} from '../Category';

export class RoomsCategories extends Packet {
  constructor(data: any) {
    super('ROOMS_CATEGORIES', data);
  }

  getCategories(): Category[] {
    return this.getData().map((cat: any) => new Category(cat.id, cat.name));
  }
}
