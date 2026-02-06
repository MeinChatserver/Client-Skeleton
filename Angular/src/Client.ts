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
      box-shadow: none;
      height: inherit;
    }

    :host.embedded ::ng-deep ui-form {
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

    ui-login ::ng-deep ui-list {
      color: var(--login-foreground-list, #000000);
      background-color: var(--login-background-list, #FFFFFF);
    }
  `]
})
export class Client implements OnInit, OnDestroy {
  @ViewChild(Login) loginComponent!: Login;
  @HostBinding('class.embedded')
  isEmbedded: boolean = false;
  meta: MetaInfo = new MetaInfo();
  websocket: WebSocket | null = null;
  connectionStatus: string = 'disconnected';
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  config: any = {
    port: 2710
  };
  chatRooms = signal<Room[]>([]);

  constructor(private cdr: ChangeDetectorRef,
  private appRef: ApplicationRef, public windowManager: WindowManager,
  private injector: EnvironmentInjector) {
  }

  ngOnInit() {
    console.log('%cwww.mein-chatserver.de - ' + this.meta.getClient() + ' ' + this.meta.getVersion(), 'background: #3b2caf; font-size: 16px; padding: 2px 10px;', 'Copyright © 2024 by Mein Chatserver. All Rights Reserved.');

    this.isEmbedded = window.self !== window.top;
    this.initializeParamConfig();
    this.initializeWebSocket();
  }

  ngOnDestroy(): void {
    this.closeWebSocket();
    this.windowManager.closeAll();
  }

  /**
   * Liest <param> Attribute aus dem parent/top document aus
   * wenn die App in einem <object> eingebettet ist
   */
  private initializeParamConfig(): void {
    try {
      const parentDoc = window.parent?.document || window.top?.document;

      if(parentDoc) {
        const objectElement = parentDoc.querySelector('object');

        if(objectElement) {
          const params = objectElement.querySelectorAll('param');

          params.forEach(param => {
            const name= param.getAttribute('name');
            let value= param.getAttribute('value');

            if(name && value) {
              this.updateLoginStyle(name, value);
            }
          });
        }
      }

      console.log('Config:', this.config);
    } catch (error) {
      console.warn('Could not access parent document (same-origin policy):', error);
    }
  }

  private updateLoginStyle(name: string, value: string | null) {
    switch(name) {
      case 'port':
        this.config[name] = Number(value);
        break;
      case 'language':
      case 'suggestion':
        this.config[name] = value;
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

  private initializeWebSocket(): void {
    const wsUrl = 'wss://demo.mein-chatserver.de:' + this.config.port;

    try {
      this.websocket = new WebSocket(wsUrl);
      this.connectionStatus = 'connecting';

      this.websocket.onopen = () => {
        console.log('WebSocket connected');
        this.connectionStatus = 'connected';
        this.reconnectAttempts = 0;

        const handshake = new Handshake();
        handshake.setClient(this.meta.getClient());
        handshake.setVersion(this.meta.getVersion());

        try {
          if(!window.top) {
            throw new Error('Can\'t find Top-Window.');
          }

          handshake.setLocation(window.top.location.href);
        } catch(error) {
          handshake.setLocation(window.location.ancestorOrigins[0]);
        }

        handshake.setUserAgent(navigator.userAgent);
        this.send(handshake);
      };

      this.websocket.onmessage = (event) => {
        this.handleWebSocketMessage(event);
      };

      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.connectionStatus = 'error';
      };

      this.websocket.onclose = () => {
        console.log('WebSocket closed');
        this.connectionStatus = 'disconnected';
        this.attemptReconnect();
      };

    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.connectionStatus = 'error';
    }
  }

  /**
   * Verarbeitet eingehende WebSocket-Nachrichten
   */
  private handleWebSocketMessage(event: MessageEvent): void {
    try {
      const packet = PacketFactory.fromJson(event.data);

      switch(packet.getOperation()) {
        case 'CONFIGURATION':
          const config = packet as Configuration;

          if(this.loginComponent) {
            const suggestion = config.getSuggestion();
            const style = config.getStyle();

            if(suggestion) {
              this.loginComponent.chatroom = suggestion;
            }

            if(style) {
              // style
              this.updateLoginStyle('background', style.getBackground());
              this.updateLoginStyle('backgroundList', style.getBackgroundList());
              this.updateLoginStyle('backgroundImage', style.getBackgroundImage());
              this.updateLoginStyle('foreground', style.getForeground());
              this.updateLoginStyle('foregroundList', style.getForegroundList());
            }

            this.cdr.detectChanges();
          }
          break;
        case 'ROOMS':
          const rooms = packet as Rooms;
          this.chatRooms.set(rooms.getRooms());
          break;
        case 'ROOMS_CATEGORIES':
          const roomCategories = packet as RoomsCategories;

          if (this.loginComponent && roomCategories.hasData()) {
            this.loginComponent.categories = [
              new Category({
                id:   null,
                name: 'Alle Chaträume'
              }),
              ...roomCategories.getCategories()
            ];
            this.cdr.detectChanges();
          }
          break;
        case 'POPUP':

          const popup = this.windowManager.createPopup({
              id: 'login-popup',
              title: 'Login',
              width: 400,
              height: 350,
              content: {
                type: 'form',
                title: 'Anmelden',
                fields: [
                  {
                    id: 'password',
                    label: 'Passwort',
                    type: 'password',
                    required: true
                  }
                ],
                submitLabel: 'Anmelden',
                cancelLabel: 'Abbrechen'
              }
          });

          popup.on('submit', (credentials: any) => {
            console.log('Login-Daten:', credentials);
          });

          this.windowManager.addFrame('hello-popup', popup);
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

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

      setTimeout(() => {
        this.initializeWebSocket();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.connectionStatus = 'failed';
    }
  }

  private closeWebSocket(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }

  send(data: any) {
    if (this.websocket) {
      if (data instanceof Packet) {
        let packet = PacketFactory.toJson(data);
        console.log('[SEND]', packet);
        this.websocket.send(packet);
      } else {
        console.warn('[SEND]', data);
        this.websocket.send(JSON.stringify(data));
      }
    }
  }

  getConfig(name: string) {
    if(!this.config) {
      return null;
    }

    return this.config[name] ?? null;
  }
}
