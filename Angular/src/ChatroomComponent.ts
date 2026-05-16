import {
  Component, Input, Output, EventEmitter,
  signal, computed, effect, CUSTOM_ELEMENTS_SCHEMA,
  ViewEncapsulation, ViewChild, ElementRef, HostListener,
  AfterViewChecked, OnDestroy, inject,
  ApplicationRef, EnvironmentInjector
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ChatMessage, ChatMessageType } from './ChatMessage';
import { Client, ConnectionStatus } from './Client';
import {List, Select, MessageInput, Button} from './Components';
import { ListItem, ListItemIcon, User } from './Models';
import { Icon } from './Models/Icon';
import {ProfileOpen} from './Models/Network/ProfileOpen';
import { FeatureService, FeatureType, ListBurnFeature, ListGlowFeature } from './Features';
import {FormsModule} from '@angular/forms';
import {ChatroomFrame} from './ChatroomFrame';
import {PrivateFrame} from './PrivateFrame';

export const CHATROOM_STYLES = `
  :host {
    cursor: default;
    display: flex;
    flex-direction: row;
    background-color: var(--room-background);
    color: var(--room-foreground);
    padding: 0;
    overflow: hidden;
    width: 100%;
    height: 100%;
  }

  main {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  main ui-output {
    position: relative;
    display: flex;
    flex: 1;
    z-index: 0;
    min-height: 0;
    border-top: 1px solid #808080;
    border-left: 1px solid #808080;
    background-image: var(--room-background-image);
    background-repeat: no-repeat;
    background-position: center center;
    background-size: cover;
  }

  main ui-output canvas {
    z-index: -1;
    position: absolute;
    width: 100%;
    display: block;
    height: 100%;
    order: 0;
    user-select: none;
  }

  main ui-output ui-messages {
    position: relative;
    flex: 1;
    min-height: 0;
    z-index: 100;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: scroll;
  }

  main ui-output ui-messages ui-text {
    padding: 0px 5px;
  }

  main ui-output ui-messages ui-text[data-type="game"] {}

  main ui-output ui-messages ui-text[data-type="action"] {
    color: var(--room-blue);
  }

  main ui-output ui-messages ui-text[data-type="public"] .sender {
    font-weight: bold;
  }

  main ui-output ui-messages ui-text[data-type="private"] .sender {
    font-weight: bold;
    color: var(--room-red);
  }

  main ui-output ui-messages ui-text[data-type="private"] .sender {
    font-weight: bold;
    color: var(--room-red);
  }

  main ui-message-input {
    flex: 0;
    border: 0;
    margin: 0;
  }

  main ui-message-input input {
    width: 100%;
    height: 100%;
    font-size: 90%;
    padding: 5px 5px;
  }

  aside {
    position: relative;
    flex: 0 200px;
    display: flex;
    margin: 0;
    border: 0;
    flex-direction: column;
  }

  aside ui-list {
    position: relative;
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    overflow-x: hidden;
    overflow-y: scroll;
    background: var(--room-background) !important;
    color: var(--room-foreground);
  }

  aside ui-list .list-item {
    color: var(--room-foreground);
    background-color: var(--room-background) !important;
  }

  aside ui-list .list-item:hover {
    background: rgba(255, 255, 255, 0.2) !important;
  }

  aside ui-list .list-item.active {
    background: rgba(0, 0, 128, 0.8) !important;
    color: #FFFFFF !important;
  }

  aside ui-list::after {
    content: "";
    position: sticky;
    display: block;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    margin-top: -101%;
    width: 100%;
    height: 100%;
    pointer-events: none;
    border-top: 1px solid #000000;
    border-left: 1px solid #000000;
    overflow: hidden;
  }

  aside ui-list ui-entry {
    padding: 2px 6px;
  }

  aside ui-list ui-entry:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  aside ui-list ui-entry[data-active="true"],
  aside ui-list ui-entry:active,
  aside ui-list ui-entry:focus {
    background: rgba(0, 0, 128, 0.8);
    color: #FFFFFF;
  }

  aside ui-select {
    font-size: 14px;
    border: 0;
    margin: 0;
    background-color: var(--room-background);
    color: var(--room-foreground);
  }

  aside ui-select select {
    padding: 5px;
  }

  aside .connecting {
    text-align: center;
    padding: 10px;
  }

  main ui-output .reconnect-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  main ui-output .reconnect-content {
    text-align: center;
  }
`;

@Component({
  selector: 'app-chatroom',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, List, Select, MessageInput, FormsModule, Button],
  template: `
    <ui-loading class="hidden"></ui-loading>
    <main>
      <ui-output data-position="CENTERED">
        <ui-messages #messagesContainer>
          @for (message of messages(); track $index) {
            <ui-text [attr.data-type]="getMessageType(message)" [innerHTML]="getMessageContent(message)"></ui-text>
          }
        </ui-messages>
        <canvas #featureCanvas style="width: 100%; height: 100%; position: absolute; top: 0; left: 0;"></canvas>
        @if(!isConnected()) {
          <div class="reconnect-overlay">
            <div class="reconnect-content">
              <ui-button (click)="onReconnect()" text="Erneut Verbinden" />
            </div>
          </div>
        }
      </ui-output>
      <ui-message-input #messageInput [placeholder]="messagePlaceholder()" [disabled]="!isConnected()" (keydown.enter)="onSendMessage()"></ui-message-input>
    </main>
    <aside>
      <ui-list [items]="userItems()" [multiselect]="true" (itemClick)="onUserSelect($event)" (itemRightClick)="onUserPrivate($event)" (selectionChange)="onUserSelectionChange($event)"></ui-list>
      <ui-select name="chatrooms" [(ngModel)]="selectedChatroom" [options]="chatrooms()" valueKey="id" labelKey="name" [disabled]="!isConnected()"></ui-select>
    </aside>
  `,
  styles: []  // Styles werden von ChatroomFrame injiziert!
})
export class ChatroomComponent implements AfterViewChecked, OnDestroy {
  @Input() client!: Client;
  @Input() frame!: ChatroomFrame;
  @Output() sendMessage = new EventEmitter<string>();
  @Output() chatroomSelect = new EventEmitter<{ type: string; item: ListItem }>();

  @ViewChild('messagesContainer') messagesContainer?: ElementRef<HTMLElement>;
  @ViewChild('messageInput') messageInput?: any;
  @ViewChild('featureCanvas') featureCanvas?: ElementRef<HTMLCanvasElement>;

  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);
  private privateFrames: Map<string, PrivateFrame> = new Map();
  private featureService = inject(FeatureService);
  private userFeatureServices: Map<string, FeatureService> = new Map();
  private activeUserFeatures: Set<string> = new Set();
  private elementRef = inject(ElementRef);
  private sanitizer = inject(DomSanitizer);
  private canvasWasInitialized = false;
  private pendingFeatures: string[] = [];

  private _selectedChatroom: string | null = null;

  get selectedChatroom(): string | null {
    return this._selectedChatroom || this.frame.getRoomName();
  }

  set selectedChatroom(value: string | null) {
    this._selectedChatroom = value;

    if (value && value !== this.frame.getRoomName()) {
      this.client.send({
        operation: 'ROOM_MESSAGE',
        data: {
          room: this.frame.getRoomName(),
          text: `/go ${value}`
        }
      });
    }
  }

  messages = signal<ChatMessage[]>([]);
  users = signal<User[]>([]);
  userIcons = signal<Map<string, Icon[]>>(new Map());
  selectedUsers = signal<User[]>([]);
  isConnected = signal<boolean>(true);
  private pendingScroll = false;
  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    effect(() => {
      if(this.client) {
        const status = this.client.connectionStatus();
        this.isConnected.set(status === ConnectionStatus.CONNECTED);
      }
    });
  }

  userItems = computed((): ListItem[] => {
    const icons = this.userIcons();

    return this.users().map(user => {
      const list = icons.get(user.username);
      return {
        id:           user.id,
        label:        user.username,
        rank:         user.rank,
        prefixIcons:  this.buildItemIcons(list, 'prefix'),
        suffixIcons:  this.buildItemIcons(list, 'suffix')
      };
    });
  });

  private buildItemIcons(list: Icon[] | undefined, side: 'prefix' | 'suffix'): ListItemIcon[] | undefined {
    if(!list || list.length === 0) {
      return undefined;
    }

    const host = this.client?.getHostname();
    const items: ListItemIcon[] = [];

    list.forEach(icon => {
      const path = icon.getPath();
      const position = icon.getPosition() ?? 0;

      if(!path) {
        return;
      }

      if(side === 'prefix' && position >= 0) {
        return;
      }

      if(side === 'suffix' && position < 0) {
        return;
      }

      const url = /^https?:\/\//i.test(path) ? path : `https://${host}${path}`;
      items.push({ url, position });
    });

    if(items.length === 0) {
      return undefined;
    }

    if(side === 'prefix') {
      // -3, -2, -1 → -3 ganz links, -1 direkt vor dem Namen
      return items.sort((a, b) => a.position - b.position);
    }

    // Suffix: zuerst positive Slots (1, 2, 3 ...), dann die 0er (auto-append) in Einfügereihenfolge
    return items.sort((a, b) => {
      if(a.position === 0 && b.position === 0) return 0;
      if(a.position === 0) return 1;
      if(b.position === 0) return -1;
      return a.position - b.position;
    });
  }

  messagePlaceholder = computed(() => {
    if(this.isConnected()) {
      return 'Gebe eine Nachricht ein...';
    }

    const reason = this.client?.disconnectMessage();

    if(reason) {
      return `Verbindung zum Chatserver verloren: ${reason}`;
    }

    return 'Verbindung verloren';
  });

  chatrooms = computed(() => {
    if (!this.client) {
      return [];
    }

    return this.client.chatRooms()
      .filter(room => room.getName() !== null)
      .map(room => ({
        id: room.getName() ?? '',
        name: room.getName() ?? ''
      }));
  });

  ngAfterViewChecked(): void {
    if (this.pendingScroll && this.messagesContainer) {
      const el = this.messagesContainer.nativeElement;
      const win = el.ownerDocument.defaultView || window;

      // Nach dem nächsten Browser-Layout scrollen, damit scrollHeight korrekt ist
      this.pendingScroll = false;
      win.requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }

    this.initializeCanvasIfNeeded();

    if (!this.canvasWasInitialized) {
      setTimeout(() => {
        this.initializeCanvasIfNeeded();
      }, 100);
    }
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    this.featureService.cleanup();
  }

  resetCanvasInitialized(): void {
    if (this.featureCanvas?.nativeElement) {
      (this.featureCanvas.nativeElement as any).__initialized = false;
    }
    this.pendingFeatures = [];
    this.canvasWasInitialized = false;

    // Force canvas re-initialization for room switch in same component
    setTimeout(() => {
      this.initializeCanvasIfNeeded();
    }, 0);
  }

  private initializeCanvasIfNeeded(): void {
    if (!this.featureCanvas?.nativeElement) {
      return;
    }

    const canvas = this.featureCanvas.nativeElement;

    if ((canvas as any).__initialized) {
      return;
    }

    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    if (this.canvasWasInitialized) {
      this.featureService.stopAnimation();
      this.featureService.removeAllFeatures();
      context.clearRect(0, 0, canvas.width, canvas.height);
    }

    this.resizeCanvasToContainer(canvas);

    if (!this.resizeObserver) {
      const container = canvas.parentElement;

      if (container) {
        this.resizeObserver = new ResizeObserver(() => {
          const oldWidth = canvas.width;
          const oldHeight = canvas.height;
          this.resizeCanvasToContainer(canvas);

          const heightChanged = Math.abs(canvas.height - oldHeight) > 50;
          const widthChanged = Math.abs(canvas.width - oldWidth) > 50;

          if ((heightChanged || widthChanged) && canvas.width > 0 && canvas.height > 0) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              const hadSnow = this.featureService.hasFeature('SNOW');
              this.featureService.stopAnimation();
              this.featureService.removeAllFeatures();
              this.featureService.initialize(canvas, ctx);

              if (hadSnow) {
                this.featureService.addFeature('SNOW' as FeatureType);
                this.featureService.startAnimation();
              }
            }
          }
        });

        this.resizeObserver.observe(container);
      }
    }

    this.featureService.initialize(canvas, context);
    (canvas as any).__initialized = true;
    this.canvasWasInitialized = true;
    console.log('[ChatroomComponent] Canvas initialized, pending features:', this.pendingFeatures);

    if (this.pendingFeatures.length > 0) {
      console.log('[ChatroomComponent] Adding pending features:', this.pendingFeatures);
      this.pendingFeatures.forEach(featureType => {
        this.featureService.addFeature(featureType as FeatureType);
      });
      this.pendingFeatures = [];
    }

    if (this.featureService.hasFeature('SNOW')) {
      console.log('[ChatroomComponent] Starting SNOW animation');
      this.featureService.startAnimation();
    }
  }

  private resizeCanvasToContainer(canvas: HTMLCanvasElement): void {
    const container = canvas.parentElement;

    if (!container) {
      return;
    }

    let width = Math.floor(container.getBoundingClientRect().width);
    let height = Math.floor(container.getBoundingClientRect().height);

    if (width <= 0) {
      width = container.clientWidth;
    }
    if (height <= 0) {
      height = container.clientHeight;
    }

    if (width <= 0) {
      width = container.offsetWidth;
    }
    if (height <= 0) {
      height = container.offsetHeight;
    }

    if (width <= 0) {
      width = 800;
    }
    if (height <= 0) {
      height = 400;
    }

    if (width > 0 && height > 0) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  private getOrCreateUserFeatureService(userId: string): FeatureService | null {
    const user = this.users().find(u => u.username === userId || String(u.id) === userId);

    if (!user) {
      return null;
    }

    let listItem: HTMLElement | null = null;
    const listItems = document.querySelectorAll('.list-item');

    for (const item of listItems) {
      const label = item.querySelector('.label');

      if (label && label.textContent?.trim() === user.username) {
        listItem = item as HTMLElement;
        break;
      }
    }

    if (!listItem) {
      return null;
    }

    const canvasElement = listItem.querySelector('canvas') as HTMLCanvasElement | null;

    if (!canvasElement) {
      return null;
    }

    if (this.userFeatureServices.has(userId)) {
      return this.userFeatureServices.get(userId) || null;
    }

    const context = canvasElement.getContext('2d');

    if (!context) {
      return null;
    }

    const parentElement = canvasElement.parentElement;

    if (parentElement) {
      const rect = parentElement.getBoundingClientRect();
      canvasElement.width = Math.max(1, Math.floor(rect.width));
      canvasElement.height = Math.max(1, Math.floor(rect.height));
    }

    const service = new FeatureService();
    service.initialize(canvasElement, context);
    this.userFeatureServices.set(userId, service);

    return service;
  }

  initMessages(messages: ChatMessage[]): void {
    this.messages.set([...messages]);
    this.pendingScroll = true;
  }

  addMessage(message: ChatMessage): void {
    this.messages.update(msgs => [...msgs, message]);
    this.pendingScroll = true;
  }

  clearMessages(): void {
    this.messages.set([]);
  }

  setUsers(users: User[]): void {
    this.users.set([...users]);

    const allowed = new Set(users.map(u => u.username));
    this.userIcons.update(map => {
      const next = new Map<string, Icon[]>();
      map.forEach((icons, username) => {
        if(allowed.has(username)) {
          next.set(username, icons);
        }
      });
      return next;
    });
  }

  addUser(user: User): void {
    this.users.update(users => {
      if (users.some(u => u.id === user.id)) {
        return users;
      }

      return [...users, user];
    });
  }

  removeUser(user: User): void {
    this.users.update(users => users.filter(u => u.id !== user.id));
    this.userIcons.update(map => {
      if(!map.has(user.username)) {
        return map;
      }

      const next = new Map(map);
      next.delete(user.username);
      return next;
    });
  }

  onSendMessage(): void {
    if (!this.messageInput) {
      return;
    }

    const value = this.messageInput.getValue().trim();

    if (value) {
      this.sendMessage.emit(value);
      (this.messageInput as any).sendMessage();
    }
  }

  @HostListener('ui-command', ['$event'])
  onUiCommand(event: Event): void {
    const command = ((event as CustomEvent<string>).detail || '').trim();

    if(!command) {
      return;
    }

    event.stopPropagation();

    if(command === '/input' || command.startsWith('/input ')) {
      const text = command.slice('/input'.length).trimStart();

      if(this.messageInput) {
        this.messageInput.setValue(text);

        const open  = text.indexOf('[');
        const close = open !== -1 ? text.indexOf(']', open) : -1;

        if(open !== -1 && close !== -1) {
          this.messageInput.select(open, close + 1);
        } else {
          this.messageInput.focus();
        }
      }

      return;
    }

    this.client.send({
      operation: 'ROOM_MESSAGE',
      data: {
        room: this.frame.getRoomName(),
        text: command
      }
    });
  }

  onUserSelect(item: ListItem): void {
    this.client.send(new ProfileOpen(item.label));
  }

  onUserPrivate(item: ListItem): void {
    const username = item.label;
    const existing = this.client.windowManager.getPrivate(username);

    if(existing && existing.isOpen()) {
      existing.focus();
      return;
    }

    const privateFrame = this.client.windowManager.createPrivate(username, this.client);

    if(this.frame) {
      privateFrame.setStyle(this.frame.getStyle());
    }

    privateFrame.on('sendMessage', (msg: string) => {
      this.client.send({
        operation: 'ROOM_MESSAGE',
        data: {
          room: this.selectedChatroom,
          text: `/p ${username}:${msg}`
        }
      });
    });

    this.privateFrames.set(username, privateFrame);
  }

  onUserSelectionChange(items: ListItem[]): void {
    this.selectedUsers.set(items.map(item => this.users().find(u => u.username === item.label)).filter((u): u is User => u !== undefined));
  }

  onChatroomSelect(type: string, item: ListItem): void {
    this.chatroomSelect.emit({ type, item });
  }

  addFeature(type: string): void {
    const featureType = type.toUpperCase() as FeatureType;

    if (Object.values(FeatureType).includes(featureType)) {
      if (!this.featureService.hasFeature(featureType)) {
        if (!this.canvasWasInitialized) {
          if (!this.pendingFeatures.includes(featureType)) {
            this.pendingFeatures.push(featureType);
          }
          return;
        }

        this.featureService.addFeature(featureType);
      }

      const canvas = this.featureCanvas?.nativeElement;
      if (canvas && canvas.height > 100) {
        this.featureService.startAnimation();
      }
    }
  }

  removeUserIcon(userId: string, icon: Icon): void {
    const user = this.users().find(u => u.username === userId || String(u.id) === userId);
    const path = icon.getPath();

    if(!user || !path) {
      return;
    }

    this.userIcons.update(map => {
      const list = map.get(user.username);

      if(!list) {
        return map;
      }

      const nextList = list.filter(existing => existing.getPath() !== path);

      if(nextList.length === list.length) {
        return map;
      }

      const next = new Map(map);

      if(nextList.length === 0) {
        next.delete(user.username);
      } else {
        next.set(user.username, nextList);
      }

      return next;
    });
  }

  addUserIcon(userId: string, icon: Icon): void {
    const user = this.users().find(u => u.username === userId || String(u.id) === userId);
    const path = icon.getPath();

    if(!user || !path) {
      return;
    }

    this.userIcons.update(map => {
      const next = new Map(map);
      // Path ist eindeutig: bestehendes Icon mit gleichem Path entfernen, dann neu anhängen
      const list = (next.get(user.username) ?? []).filter(existing => existing.getPath() !== path);
      list.push(icon);
      next.set(user.username, list);
      return next;
    });
  }

  addUserFeature(type: string, userId: string): void {
    const featureType = type.toUpperCase();
    const user = this.users().find(u => u.username === userId || String(u.id) === userId);

    if (!user) {
      return;
    }

    // Verhindere doppelte Features für denselben User
    const featureKey = `${user.username}:${featureType}`;
    if (this.activeUserFeatures.has(featureKey)) {
      return;
    }

    const doc = this.elementRef.nativeElement.ownerDocument;
    const userListContainer = doc.querySelector('aside ui-list');

    if (!userListContainer) {
      return;
    }

    const html = (userListContainer as any).innerHTML || '';
    let listItem: HTMLElement | null = null;
    const listItems = userListContainer.querySelectorAll('.list-item');

    for (const item of listItems) {
      const label = item.querySelector('.label');
      const labelText = label?.textContent?.trim();

      if (labelText === user.username) {
        listItem = item as HTMLElement;
        break;
      }
    }

    if (!listItem) {
      return;
    }

    let feature = null;
    const dummyCanvas = doc.createElement('canvas');

    switch(featureType) {
      case 'BURN':
        feature = new ListBurnFeature();
      break;
      case 'GLOW':
        feature = new ListGlowFeature();
      break;
    }

    if(feature != null) {
      feature.onInit(dummyCanvas, null as any, listItem);
      feature.onStart();
      this.startUserFeatureAnimation(user.username, feature, listItem);
      this.activeUserFeatures.add(featureKey);
    }
  }

  removeFeature(type: string): void {
    this.featureService.removeFeature(type.toUpperCase());

    // @ToDo
    if (!this.featureService.hasFeature(FeatureType.SNOW)) {
      this.featureService.stopAnimation();
    }
  }

  removeAllFeatures(): void {
    this.featureService.removeAllFeatures();
    this.featureService.stopAnimation();
    this.activeUserFeatures.clear();
  }

  hasFeature(type: string): boolean {
    return this.featureService.hasFeature(type.toUpperCase());
  }

  private startUserFeatureAnimation(userId: string, feature: any, listItem?: HTMLElement): void {
    const win = (listItem?.ownerDocument.defaultView) || window;

    const animate = (timestamp: number) => {
      feature.onPaint(null, timestamp);
      win.requestAnimationFrame(animate);
    };

    win.requestAnimationFrame(animate);
  }

  getSelectedUsers(): User[] {
    return this.selectedUsers();
  }

  setConnected(connected: boolean): void {
    this.isConnected.set(connected);
  }

  getMessageType(message: ChatMessage): string {
    return message.type.toLowerCase();
  }

  getMessageContent(message: ChatMessage): SafeHtml {
    let html: string;

    switch(message.type) {
      case ChatMessageType.GAME:
      case ChatMessageType.ACTION:
        html = message.message ?? '';
        break;
      case ChatMessageType.PUBLIC:
        html = `<span class="sender">${message.getUsername()}:</span> ${message.message}`;
        break;
      case ChatMessageType.PRIVATE: {
        let target = '';

        if(message.users && message.users.length >= 1) {
          target = ' an ' + message.users.map(user =>
            `<span data-action="profile:${user}">${user}</span>`
          ).join(', ');
        }

        html = `<span class="sender">${message.getUsername()} (privat${target}):</span> ${message.message}`;
        break;
      }
      default:
        html = message.message ?? '';
    }

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  onReconnect(): void {
    this.client.reconnect();
  }
}
