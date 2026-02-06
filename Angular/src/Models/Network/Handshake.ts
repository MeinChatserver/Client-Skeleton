import {Packet} from './Packet';

/**
 * Dieses Paket kann Grundlegende Informationen oder Steuerungen zum Chatserver senden.
 *
 * Wichtig:
 * Sendet der Client dieses Paket nicht am Anfang nach erfolgreicher Verbindung, so wird die Verbindung automatisch nach 5 Sekunden getrennt.
 *
 * @docs https://github.com/MeinChatserver/Documentation/blob/main/Protocol/Packets/HANDSHAKE.md
 **/
export class Handshake extends Packet {
  protected client: string | null = null;
  protected version: string | null = null;
  protected location: string | null = null;
  protected userAgent: string | null = null;

  constructor(data: any = null) {
    super('HANDSHAKE', data);
  }

  setClient(client: string) {
    this.client = client;
  }

  setVersion(version: string) {
    this.version = version;
  }

  setLocation(location: string) {
    this.location = location;
  }

  setUserAgent(userAgent: string) {
    this.userAgent = userAgent;
  }
}
