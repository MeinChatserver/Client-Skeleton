import {
  signal,
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ChangeDetectorRef,
  HostBinding,
  ApplicationRef, EnvironmentInjector
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {Login} from './Login';
import { WindowManager } from './WindowManager';
import {Category} from './Models/Category';
import {PacketFactory} from './Models/Network/PacketFactory';
import {Configuration} from './Models/Network/Configuration';
import {RoomsCategories} from './Models/Network/RoomsCategories';
import {Handshake} from './Models/Network/Handshake';
import {Packet} from './Models/Network/Packet';
import {Rooms} from './Models/Network/Rooms';
import {Room} from './Models/Room';
import {MetaInfo} from './Models/MetaInfo';
import {Popup} from './Models/Network/Popup';
import {Disconnect} from './Models/Network/Disconnect';

@Component({
  selector: 'body',
  standalone: true,
  providers: [WindowManager],
  imports: [CommonModule, Login],
  template: `<ui-login [client]="this" />`,
  styles: [`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }

    :host.embedded {
      align-items: stretch;
      justify-content: stretch;
    }

    ui-login {
      width: 400px;
      height: 600px;
      padding: 0 20px;
      color: var(--login-foreground, #000000);
      background-color: var(--login-background, #DDDDDD);
      background-image: var(--login-background-image, initial);
      background-repeat: no-repeat;
      background-size: cover;
      display: flex;
      flex-direction: column;
      box-shadow: 0 0 5px -1px rgba(0, 0, 0, 1);
    }

    :host.embedded ui-login {
      flex-direction: row;
      flex: 1;
      padding: 0;
      box-shadow: none;
      height: inherit;
    }

    :host ::ng-deep ui-form {
      padding: 5px 0 !important;
    }

    :host.embedded ::ng-deep ui-form {
      padding: 10px !important;
      grid-template-rows: auto 1fr auto auto auto auto 1fr auto;
      grid-template-areas:
        "category_label category_element"
        ". ."
        "username_label username_element"
        "password_label password_element"
        "chatroom_label chatroom_element"
        ". remember"
        ". ."
        "button button";
    }


    :host.embedded ::ng-deep ui-label[name="username"],
    :host.embedded ::ng-deep ui-label[name="password"] {
      text-align: left !important;
    }


    ui-login ::ng-deep ui-list {
      color: var(--login-foreground-list, #000000);
      background-color: var(--login-background-list, #FFFFFF);
    }

    :host ::ng-deep ui-form a {
      padding: 0 20px;
      color: var(--login-foreground-list, #000000);
      text-decoration: underline;
    }

    :host ::ng-deep ui-form a:hover,
    :host ::ng-deep ui-form a:active {
      color: red;
      text-decoration: underline;
    }
  `]
})
export class Client implements OnInit, OnDestroy {
  @ViewChild(Login) loginComponent!: Login;
  @HostBinding('class.embedded')
  isEmbedded: boolean = false;
  hostname: string | null = null;
  port: number = 2710;
  meta: MetaInfo = new MetaInfo();
  socket: WebSocket | null = null;
  connectionStatus: string = 'disconnected';
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  chatRooms = signal<Room[]>([]);

  constructor(
    private cdr: ChangeDetectorRef,
    private appRef: ApplicationRef,
    public windowManager: WindowManager,
    private injector: EnvironmentInjector
  ) {
    /* Do Nothing */
  }

  ngOnInit() {
    console.log('%cwww.mein-chatserver.de - ' + this.meta.getClient() + ' ' + this.meta.getVersion(), 'background: #3b2caf; font-size: 16px; padding: 2px 10px;', 'Copyright © 2024 by Mein Chatserver. All Rights Reserved.');

    this.isEmbedded = window.self !== window.top;

    /* Load Hostname */
    if(window.location.protocol !== 'file:' && window.location.hostname !== 'localhost') {
      this.hostname = window.location.hostname;
    }

    window.addEventListener('unload', () => {
      this.windowManager.closeAll();
      this.disconnect(true);
    });

    /* Load Defaults */
    try {
      Object.entries((window as any).Defaults.style).forEach(([name, value]) => {
        if (!name || !value) {
          return;
        }

        this.updateConfigurations(name, String(value));
      });

      this.port = (window as any).Defaults.port;

      if ((window as any).Defaults.suggestion) {
        this.loginComponent.chatroom = (window as any).Defaults.suggestion;
      }
    } catch (e) {
    }

    /* Load Parameters */
    try {
      const parentDoc = window.parent?.document || window.top?.document;

      if (parentDoc) {
        const objectElement = parentDoc.querySelector('object');

        if (objectElement) {
          const params = objectElement.querySelectorAll('param');

          params.forEach(param => {
            const name = param.getAttribute('name');
            let value = param.getAttribute('value');

            if (name && value) {
              this.updateConfigurations(name, value);
            }
          });
        }
      }
    } catch (error) {
      console.warn('Could not access parent document (same-origin policy):', error);
    }

    /* Prepare Socket */
    this.connect();
  }

  ngOnDestroy(): void {
    this.disconnect(true);
  }

  private updateConfigurations(name: string, value: string | null) {
    switch (name) {
      case 'port':
        this.port = Number(value);
        break;
      case 'suggestion':
        if (value) {
          this.loginComponent.chatroom = value;
        }
        break;
      case 'backgroundImage':
        document.documentElement.style.setProperty('--login-background-image', 'url(' + value + ')');
        break;
      case 'background':
        document.documentElement.style.setProperty('--login-background', value);
        break;
      case 'foreground':
        document.documentElement.style.setProperty('--login-foreground', value);
        break;
      case 'backgroundList':
        document.documentElement.style.setProperty('--login-background-list', value);
        break;
      case 'foregroundList':
        document.documentElement.style.setProperty('--login-foreground-list', value);
        break;
      default:
        console.warn('Unsupported Parameter:', name, value);
        break;
    }
  }

  getHostname() {
    /* Fix Demo */
    if(this.hostname === null || this.hostname.length === 0 || this.hostname === 'www.mein-chatserver.de') {
      this.hostname = 'demo.mein-chatserver.de';
    }

    return this.hostname;
  }

  getPort() {
    return this.port;
  }

  private connect(hard: boolean = false): void {
    this.disconnect(hard);

    try {
      this.socket				    = new WebSocket(`wss://${this.getHostname()}:${this.getPort()}/`);
      this.connectionStatus = 'connecting';
      this.socket.onopen    = this.onOpen.bind(this);
      this.socket.onclose   = this.onClose.bind(this);
      this.socket.onerror   = this.onError.bind(this);
      this.socket.onmessage = this.onReceive.bind(this);
    } catch(error) {
      console.error('Failed to create WebSocket:', error);
      this.connectionStatus = 'error';
    }
  }

  private onOpen() {
    console.log('WebSocket connected');
    this.connectionStatus = 'connected';
    this.reconnectAttempts = 0;

    const handshake = new Handshake();
    handshake.setClient(this.meta.getClient());
    handshake.setVersion(this.meta.getVersion());

    try {
      if (!window.top) {
        throw new Error('Can\'t find Top-Window.');
      }

      handshake.setLocation(window.top.location.href);
    } catch (error) {
      handshake.setLocation(window.location.ancestorOrigins[0]);
    }

    handshake.setUserAgent(navigator.userAgent);
    this.send(handshake);
  }

  private onClose() {
    console.log('WebSocket closed');
    this.connectionStatus = 'disconnected';
    this.attemptReconnect();
  }

  private onError(error: any) {
    console.error('WebSocket error:', error);
    this.connectionStatus = 'error';
  }

  private onReceive(event: MessageEvent): void {
    try {
      const packet = PacketFactory.fromJson(event.data);

      switch (packet.getOperation()) {
        case 'CONFIGURATION':
          const config = packet as Configuration;

          if (this.loginComponent) {
            const suggestion = config.getSuggestion();
            const style = config.getStyle();

            if (suggestion) {
              this.loginComponent.chatroom = suggestion;
            }

            if (style) {
              this.updateConfigurations('background', style.getBackground());
              this.updateConfigurations('backgroundList', style.getBackgroundList());
              this.updateConfigurations('backgroundImage', style.getBackgroundImage());
              this.updateConfigurations('foreground', style.getForeground());
              this.updateConfigurations('foregroundList', style.getForegroundList());
            }

            this.cdr.detectChanges();
          }
          break;
        case 'ROOMS':
          this.chatRooms.set((packet as Rooms).getRooms());
          break;
        case 'ROOMS_CATEGORIES':
          const roomCategories = packet as RoomsCategories;

          if (this.loginComponent && roomCategories.hasData()) {
            this.loginComponent.categories = [
              new Category({
                id: null,
                name: 'Alle Chaträume'
              }),
              ...roomCategories.getCategories()
            ];
            this.cdr.detectChanges();
          }
          break;
        case 'POPUP':
          this.windowManager.createPopup(packet as Popup);
          break;
        case 'WINDOW_ROOM':
          const chatroom = this.windowManager.createChatroom(
            {
              id: 'support-chat',
              title: 'Chatraum',
              width: 400,
              height: 600
            }
          );
          this.windowManager.addFrame('dwqqw-popup', chatroom);
          break;
        case 'WINDOW_ROOM_CLOSE':

          break;
        case 'WINDOW_ROOM_UPDATE':

          break;
      }
      console.log('Received message:', packet);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  private disconnect(hard: boolean = false) {
    /* Sending Disconnect */
    if(this.socket !== null) {
      this.send(new Disconnect());
    }

    /* Close all Frames */
    if(hard) {
      this.windowManager.closeAll();
    }

    /* Close the Socket */
    if(this.socket !== null) {
      if(this.socket.readyState === WebSocket.OPEN) {
        this.socket.close();
      }

      this.socket = null;
    }
  }

  isConnected() {
    if(this.socket == null) {
      return false;
    }

    if(this.socket.readyState === this.socket.CLOSED){
      return false;
    }

    return (this.socket.readyState === this.socket.OPEN);
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.connectionStatus = 'failed';
    }
  }

  send(data: any) {
    if(!this.isConnected()) {
      return;
    }

    if(data instanceof Packet) {
      let packet = PacketFactory.toJson(data);
      console.log('[SEND]', packet);
      this.socket?.send(packet);
    } else {
      console.warn('[SEND]', data);
      this.socket?.send(JSON.stringify(data));
    }
  }
}
