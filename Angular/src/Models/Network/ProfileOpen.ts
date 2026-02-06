import {Packet} from './Packet';

/**
 * Dieses Packet wird zum Server gesendet, wenn ein Nutzerprofil aufgerufen/geöffnet werden soll.
 *
 * @docs https://github.com/MeinChatserver/Documentation/blob/main/Protocol/Packets/PROFILE_OPEN.md
 **/
export class ProfileOpen extends Packet {
  constructor(username: string | null = null) {
    super('PROFILE_OPEN', username);
  }
}
