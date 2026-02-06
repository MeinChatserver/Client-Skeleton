import {Packet} from './Packet';

/**
 * Dieses Paket wird nach einem HANDSHAKE automatisch an den Clienten gesendet.
 *
 * @docs https://github.com/MeinChatserver/Documentation/blob/main/Protocol/Packets/CONFIGURATION.md
 **/
export class Configuration extends Packet {
  protected id: string | null = null;
  protected suggestion: string | null = null;
  protected style: LoginStyle | null = null;

  constructor(data: any) {
    super('CONFIGURATION', data);

    if(data.id) {
      this.id = data.id;
    }

    if(data.suggestion) {
      this.suggestion = data.suggestion;
    }

    if(data.style) {
      this.style = new LoginStyle(data.style);
    }
  }

  getClientId(): string | null {
    return this.id;
  }

  getSuggestion(): string | null {
    return this.suggestion;
  }

  getStyle(): LoginStyle | null {
    return this.style;
  }
}

class LoginStyle {
  protected background: string | null = null;
  protected backgroundImage: string | null = null;
  protected backgroundList: string | null = null;
  protected foreground: string | null = null;
  protected foregroundList: string | null = null;
  protected theme: string | null = null;

  constructor(data: any) {
    if(data.background) {
      this.background = data.background;
    }

    if(data.backgroundImage) {
      this.backgroundImage = data.backgroundImage;
    }

    if(data.backgroundList) {
      this.backgroundList = data.backgroundList;
    }

    if(data.foreground) {
      this.foreground = data.foreground;
    }

    if(data.foregroundList) {
      this.foregroundList = data.foregroundList;
    }

    if(data.theme) {
      this.theme = data.theme;
    }
  }

  getBackground() {
    return this.background;
  }

  getBackgroundImage() {
    return this.backgroundImage;
  }

  getBackgroundList() {
    return this.backgroundList;
  }

  getForeground() {
    return this.foreground;
  }

  getForegroundList() {
    return this.foregroundList;
  }

  getTheme() {
    return this.theme;
  }
}
