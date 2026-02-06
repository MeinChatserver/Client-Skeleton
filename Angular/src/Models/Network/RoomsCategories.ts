import {Packet} from './Packet';
import {Category} from '../Category';

/**
 * Dieses Paket wird nach einem HANDSHAKE automatisch an den Clienten gesendet.
 *
 * @docs https://github.com/MeinChatserver/Documentation/blob/main/Protocol/Packets/ROOMS_CATEGORIES.md
 **/
export class RoomsCategories extends Packet {
  constructor(data: any) {
    super('ROOMS_CATEGORIES', data);
  }

  getCategories(): Category[] {
    return this.getData().map((category: any) => new Category(category));
  }
}
