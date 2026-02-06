import {Packet} from './Packet';

export class Configuration extends Packet {
  constructor(data: any) {
    super('CONFIGURATION', data);
  }

  getSuggestion(): string {
    return this.getData().suggestion;
  }
}
