import {Popup} from './Popup';

/**
 * Dieses Paket wird nach erfolgreichem Login durch das LOGIN-Paket versendet und öffnet im Clienten ein Chatfenster mit dem jeweiligen Raum.
 *
 * Achtung:
 * Der Client muss nach erstellen das Paket WINDOW_INIT versenden. Damit wird dem Chatserver mitgeteilt, dass der Nutzer nun "mitlesen" kann und die Darstellung erfogreich geladen wurde.
 *
 * @docs https://github.com/MeinChatserver/Documentation/blob/main/Protocol/Packets/WINDOW_ROOM.md
 **/
export class WindowRoom extends Popup {
  protected room: any = null;

  constructor(data: any = null) {
    super(data);
    super.setOperation('WINDOW_ROOM');

    if(data.room) {
      this.room = data.room;
    }
  }

  getRoom(): any {
    return this.room;
  }

  getStyle(): any {
    return this.room?.style ?? null;
  }

  getUsers(): any[] | null {
    return this.room?.users ?? null;
  }
}
