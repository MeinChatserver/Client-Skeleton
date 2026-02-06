import {Packet} from './Packet';

/**
 * Dieses Paket wird nach erfolgreichem Login durch das LOGIN-Paket versendet und öffnet im Clienten ein Chatfenster mit dem jeweiligen Raum.
 *
 * Achtung:
 * Der Client muss nach erstellen das Paket WINDOW_INIT versenden. Damit wird dem Chatserver mitgeteilt, dass der Nutzer nun "mitlesen" kann und die Darstellung erfogreich geladen wurde.
 *
 * @docs https://github.com/MeinChatserver/Documentation/blob/main/Protocol/Packets/WINDOW_ROOM.md
 **/
export class WindowRoom extends Packet {
  protected name: string | null = null;

  constructor(data: any = null) {
    super('WINDOW_ROOM', data);

    if(data.name) {
      this.name = data.name;
    }

    // @ToDo
  }

  getName() {
    return this.name;
  }
}
