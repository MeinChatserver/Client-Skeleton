import {Packet} from './Packet';
import {Configuration} from './Configuration';
import {RoomsCategories} from './RoomsCategories';
import {Rooms} from './Rooms';
import {Popup} from './Popup';

export class PacketFactory {
  static fromJson(json: string | any): Packet {
    const parsed = typeof(json === 'string') ? JSON.parse(json) : json;

    switch(parsed.operation) {
      case 'CONFIGURATION':
        return new Configuration(parsed.data);
      case 'ROOMS':
        return new Rooms(parsed.data);
      case 'ROOMS_CATEGORIES':
        return new RoomsCategories(parsed.data);
      case 'POPUP':
        return new Popup(parsed.data);
      default:
       console.warn(`Unknown operation: ${parsed.operation}`);
        return new Packet(parsed.operation, parsed.data);
    }
  }

  static toJson(packet: Packet): string {
    const { operation, data, ...rest } = packet as any;
    let packetData = {};

    if(Object.keys(rest).length > 0) {
      packetData = { ...rest };
    } else if(data) {
      packetData = data;
    }

    return JSON.stringify({
      operation: packet.getOperation(),
      data: packetData
    });
  }
}
