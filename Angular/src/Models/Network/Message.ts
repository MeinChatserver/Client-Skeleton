import {Packet} from './Packet';

export class Message extends Packet {
  protected room: string | null = null;
  protected text: string | null = null;

  constructor(data: any = null) {
    super('MESSAGE', data);

    if(data.room) {
      this.room = data.room;
    }

    if(data.text) {
      this.text = data.text;
    }
  }

  hasRoom() {
    return (this.room !== null);
  }

  forAll() {
    return (this.room === '-');
  }

  getRoom() {
    return this.room;
  }

  hasText() {
    return (this.text !== null);
  }

  getText() {
    return this.text;
  }
}
