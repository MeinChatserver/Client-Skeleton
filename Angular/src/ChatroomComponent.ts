import {
  Component, Input, Output, EventEmitter,
  signal, computed, CUSTOM_ELEMENTS_SCHEMA,
  ViewEncapsulation, ViewChild, ElementRef,
  AfterViewChecked, OnDestroy, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatMessage, ChatMessageType } from './ChatMessage';
import { Client } from './Client';
import {List, Select, Textfield} from './Components';
import { ListItem, User } from './Models';
import {ProfileOpen} from './Models/Network/ProfileOpen';
import { FeatureService, FeatureType, ListBurnFeature, ListGlowFeature } from './Features';
import {CategoryChange} from './Models/Network';
import {FormsModule} from '@angular/forms';
import {ChatroomFrame} from './ChatroomFrame';

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

  main ui-input {
    flex: 0;
  }

  main ui-input input {
    width: 100%;
    height: 100%;
    font-size: 90%;
    padding: 5px 5px;
  }

  aside {
    position: relative;
    flex: 0 200px;
    border-top: 1px solid #808080;
    border-left: 1px solid #808080;
    display: flex;
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
    color: var(--room-foreground) !important;
    border-color: transparent !important;
  }

  aside ui-list .list-item {
    color: var(--room-foreground) !important;
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
    font-size: 16px;
    margin: 1px;
    background-color: var(--room-background);
    color: var(--room-foreground);
  }

  aside ui-select select {
    padding: 4px;
  }

  aside .connecting {
    text-align: center;
    padding: 10px;
  }
`;

@Component({
  selector: 'app-chatroom',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, List, Select, Textfield, FormsModule],
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
      </ui-output>
      <ui-input #messageInput placeholder="Gebe eine Nachricht ein..." (keydown.enter)="onSendMessage()"></ui-input>
    </main>
    <aside>
      <ui-list [items]="userItems()" [multiselect]="true" (itemClick)="onUserSelect($event)" (selectionChange)="onUserSelectionChange($event)"></ui-list>
      <ui-select name="chatrooms" [(ngModel)]="selectedChatroom" [options]="chatrooms()" valueKey="id" labelKey="name"></ui-select>
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

  private featureService = inject(FeatureService);
  private userFeatureServices: Map<string, FeatureService> = new Map();
  private elementRef = inject(ElementRef);
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
  selectedUsers = signal<User[]>([]);
  isConnected = signal<boolean>(false);
  private pendingScroll = false;
  private resizeObserver: ResizeObserver | null = null;

  userItems = computed((): ListItem[] =>
    this.users().map(user => ({ id: user.id, label: user.username, count: 0, rank: user.rank }))
  );

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
      el.scrollTop = el.scrollHeight;
      this.pendingScroll = false;
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
  }

  onSendMessage(): void {
    if (!this.messageInput) {
      return;
    }

    const value = this.messageInput.getValue().trim();

    if (value) {
      this.sendMessage.emit(value);
      this.messageInput.setValue('');
    }
  }

  onUserSelect(item: ListItem): void {
    this.client.send(new ProfileOpen(item.label));
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

  addUserFeature(type: string, userId: string): void {
    const featureType = type.toUpperCase();
    const user = this.users().find(u => u.username === userId || String(u.id) === userId);

    if (!user) {
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

    if (featureType === 'BURN') {
      const burnFeature = new ListBurnFeature();
      const dummyCanvas = document.createElement('canvas');
      burnFeature.onInit(dummyCanvas, null as any, listItem);
      burnFeature.onStart();
      this.startUserFeatureAnimation(user.username, burnFeature);
    } else if (featureType === 'GLOW') {
      const glowFeature = new ListGlowFeature();
      const dummyCanvas = document.createElement('canvas');
      glowFeature.onInit(dummyCanvas, null as any, listItem);
      glowFeature.onStart();
      this.startUserFeatureAnimation(user.username, glowFeature);
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
  }

  hasFeature(type: string): boolean {
    return this.featureService.hasFeature(type.toUpperCase());
  }

  private startUserFeatureAnimation(userId: string, feature: any): void {
    const animate = (timestamp: number) => {
      feature.onPaint(null, timestamp);
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
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

  getMessageContent(message: ChatMessage): string {
    switch(message.type) {
      case ChatMessageType.ACTION:
        return message.message ?? '';
      case ChatMessageType.PUBLIC:
        return `<span class="sender">${message.getUsername()}:</span> ${message.message}`;
      case ChatMessageType.PRIVATE: {
        let target = '';

        if(message.users && message.users.length >= 1) {
          target = ' an ' + message.users.map(user =>
            `<span data-action="profile:${user}">${user}</span>`
          ).join(', ');
        }

        return `<span class="sender">${message.getUsername()} (privat${target}):</span> ${message.message}`;
      }
    }
  }
}
