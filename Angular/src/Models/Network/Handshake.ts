import {Packet} from './Packet';

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
