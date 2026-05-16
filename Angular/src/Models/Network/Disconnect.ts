import {Packet} from './Packet';

/**
 * Dieses Paket wird entweder vom Clienten als auch vom Server als Benachrichtigung zu einem Disconnect versendet und beendet die Verbindung.
 *
 * @docs https://github.com/MeinChatserver/Documentation/blob/main/Protocol/Packets/DISCONNECT.md
 **/
export class Disconnect extends Packet {
  protected message: string | null = null;

  constructor(data: any = null) {
    super('DISCONNECT', data);

    if(typeof data === 'string') {
      this.message = data;
    } else if(data?.message) {
      this.message = data.message;
    }
  }

  getMessage(): string | null {
    return this.message;
  }

  hasMessage(): boolean {
    return this.message !== null && this.message.length > 0;
  }
}
