import {Packet} from './Packet';
import {Configuration} from './Configuration';
import {RoomsCategories} from './RoomsCategories';
import {Rooms} from './Rooms';
import {Popup} from './Popup';
import {Ping} from './Ping';
import {Pong} from './Pong';
import {Alert} from './Alert';
import {WindowRoom} from './WindowRoom';
import {WindowRoomUpdate} from './WindowRoomUpdate';
import {RoomUpdate} from './RoomUpdate';
import {RoomUserAdd} from './RoomUserAdd';
import {RoomUserRemove} from './RoomUserRemove';
import {MessagePrivate} from './MessagePrivate';
import {MessageAction} from './MessageAction';
import {MessagePublic} from './MessagePublic';
import {WindowRoomClose} from './WindowRoomClose';
import {RoomFeature} from './RoomFeature';
import {RoomUserFeature} from './RoomUserFeature';

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
      case 'PING':
        return new Ping(parsed.data);
      case 'PONG':
        return new Pong(parsed.data);
      case 'ALERT':
        return new Alert(parsed.data);
      case 'POPUP':
        return new Popup(parsed.data);
      case 'WINDOW_ROOM':
        return new WindowRoom(parsed.data);
      case 'WINDOW_ROOM_CLOSE':
        return new WindowRoomClose(parsed.data);
      case 'WINDOW_ROOM_UPDATE':
        return new WindowRoomUpdate(parsed.data);
      case 'ROOM_FEATURE':
        return new RoomFeature(parsed.data);
      case 'ROOM_UPDATE':
        return new RoomUpdate(parsed.data);
      case 'ROOM_USER_ADD':
        return new RoomUserAdd(parsed.data);
      case 'ROOM_USER_REMOVE':
        return new RoomUserRemove(parsed.data);
      case 'ROOM_USER_FEATURE':
        return new RoomUserFeature(parsed.data);
      case 'MESSAGE_PRIVATE':
        return new MessagePrivate(parsed.data);
      case 'MESSAGE_ACTION':
        return new MessageAction(parsed.data);
      case 'MESSAGE_PUBLIC':
        return new MessagePublic(parsed.data);
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
