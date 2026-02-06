import {Packet} from './Packet';

/**
 * @docs https://github.com/MeinChatserver/Documentation/blob/main/Protocol/Packets/ALERT.md
 **/
export class Alert extends Packet {
  protected text: string | null = null;

  constructor(data: any = null) {
    super('ALERT', data);

    if(data) {
      this.text = data;
    }
  }

  getText() {
    return this.text;
  }
}
