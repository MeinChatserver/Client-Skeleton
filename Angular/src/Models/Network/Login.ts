import {Packet} from './Packet';

/**
 * Dieses Paket meldet einen Benutzer im Chatsystem an.
 *
 * @docs https://github.com/MeinChatserver/Documentation/blob/main/Protocol/Packets/LOGIN.md
 **/
export class Login extends Packet {
  protected username: string | null = null;
  protected password: string | null = null;
  protected chatroom: string | null = null;

  constructor(data: any = null) {
    super('LOGIN', data);

    if(data.username) {
      this.username = data.username;
    }

    if(data.password) {
      this.password = data.password;
    }

    if(data.chatroom) {
      this.chatroom = data.chatroom;
    }
  }

  setUsername(username: string) {
    this.username = username;
  }

  setPassword(password: string) {
    this.password = password;
  }

  setChatroom(chatroom: string) {
    this.chatroom = chatroom;
  }
}
