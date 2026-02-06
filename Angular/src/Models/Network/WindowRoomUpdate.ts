import {RoomUpdate} from './RoomUpdate';

/**
 * Dieses Paket wird versendet, wenn ein Nutzer per Befehl den Chatraum wechselt ohne ein neues Chatfenster mit dem jeweiligen Raum zu eröffnen.
 *
 * Der Unterschied von WINDOW_ROOM_UPDATE und WINDOW_ROOM ist, dass beim UPDATE zusätzlich noch der alte Chatraum-Name mit reference übergeben wird, damit das alte Chatraum-Fenster Clientseitig "gefunden" werden kann - dieer wird bei einem UPDATE mit den neuen WINDOW-Daten überschrieben.
 *
 * Achtung:
 * Der Client muss nach erstellen das Paket WINDOW_INIT versenden. Damit wird dem Chatserver mitgeteilt, dass der Nutzer nun "mitlesen" kann und die Darstellung erfogreich geladen wurde.
 *
 * @docs https://github.com/MeinChatserver/Documentation/blob/main/Protocol/Packets/WINDOW_ROOM_UPDATE.md
 **/
export class WindowRoomUpdate extends RoomUpdate {
  protected reference: string | null = null;

  constructor(data: any = null) {
    super(data);
    super.setOperation('WINDOW_ROOM_UPDATE');

    if(data.reference) {
      this.reference = data.reference;
    }
  }

  getReference() {
    return this.reference;
  }
}
