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
import { FeatureService, FeatureType } from './Features';
import { ListBurnFeature } from './Features/ListBurnFeature';
import { ListGlowFeature } from './Features/ListGlowFeature';

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
    padding: 0 5px;
  }

  main ui-output ui-messages ui-text[data-type="action"] {
    color: var(--room-blue);
  }

  main ui-output ui-messages ui-text[data-type="public"] a.sender {
    font-weight: bold;
  }

  main ui-output ui-messages ui-text[data-type="private"] a.sender {
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
  imports: [CommonModule, List, Select, Textfield],
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
      <ui-select name="chatrooms" [options]="chatrooms()" valueKey="id" labelKey="name"></ui-select>
    </aside>
  `,
  styles: []  // Styles werden von ChatroomFrame injiziert!
})
export class ChatroomComponent implements AfterViewChecked, OnDestroy {
  @Input() client!: Client;
  @Input() roomName: string = '';
  @Output() sendMessage = new EventEmitter<string>();
  @Output() chatroomSelect = new EventEmitter<{ type: string; item: ListItem }>();

  @ViewChild('messagesContainer') messagesContainer?: ElementRef<HTMLElement>;
  @ViewChild('messageInput') messageInput?: any;
  @ViewChild('featureCanvas') featureCanvas?: ElementRef<HTMLCanvasElement>;

  private featureService = inject(FeatureService);
  private userFeatureServices: Map<string, FeatureService> = new Map();
  private elementRef = inject(ElementRef);

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
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    this.featureService.cleanup();
  }

  private initializeCanvasIfNeeded(): void {
    if (!this.featureCanvas?.nativeElement) return;

    const canvas = this.featureCanvas.nativeElement;
    if ((canvas as any).__initialized) return;

    const context = canvas.getContext('2d');
    if (!context) {
      console.warn('[ChatroomComponent] Failed to get canvas context');
      return;
    }

    // Resize canvas to match container
    this.resizeCanvasToContainer(canvas);

    // Set up ResizeObserver for responsive resizing
    if (!this.resizeObserver) {
      const container = canvas.parentElement;
      if (container) {
        this.resizeObserver = new ResizeObserver(() => {
          this.resizeCanvasToContainer(canvas);
        });
        this.resizeObserver.observe(container);
      }
    }

    this.featureService.initialize(canvas, context);
    (canvas as any).__initialized = true;
  }

  private resizeCanvasToContainer(canvas: HTMLCanvasElement): void {
    const container = canvas.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();

    // Only resize if container has actual dimensions
    if (rect.width <= 0 || rect.height <= 0) {
      return;
    }

    canvas.width = Math.floor(rect.width);
    canvas.height = Math.floor(rect.height);

    console.log(`[ChatroomComponent] Canvas resized to ${canvas.width}x${canvas.height}`);
  }

  private getOrCreateUserFeatureService(userId: string): FeatureService | null {
    // Finde den User nach Username
    const user = this.users().find(u => u.username === userId || String(u.id) === userId);
    if (!user) {
      console.warn(`[ChatroomComponent] User not found: ${userId}`);
      return null;
    }

    // Suche das ListItem Element nach dem Label-Text
    let listItem: HTMLElement | null = null;
    const listItems = document.querySelectorAll('.list-item');
    console.log(`[ChatroomComponent] Searching for user "${user.username}" in ${listItems.length} list items`);

    for (const item of listItems) {
      const label = item.querySelector('.label');
      if (label && label.textContent?.trim() === user.username) {
        listItem = item as HTMLElement;
        console.log(`[ChatroomComponent] Found list item for user: ${user.username}`);
        break;
      }
    }

    if (!listItem) {
      console.warn(`[ChatroomComponent] Could not find list item for user ${user.username}`);
      // Debug: Zeige alle Labels
      const labels = Array.from(listItems).map((item: any) => item.querySelector('.label')?.textContent?.trim());
      console.log(`[ChatroomComponent] Available user labels:`, labels);
      return null;
    }

    // Finde das Canvas innerhalb dieses ListItems
    const canvasElement = listItem.querySelector('canvas') as HTMLCanvasElement | null;
    if (!canvasElement) {
      console.warn(`[ChatroomComponent] Canvas not found in list item for user ${user.username} (id ${user.id})`);
      return null;
    }

    console.log(`[ChatroomComponent] Found canvas for user ${user.username} (id ${user.id})`);

    // Wenn Service bereits existiert, gib ihn zurück
    if (this.userFeatureServices.has(userId)) {
      return this.userFeatureServices.get(userId) || null;
    }

    // Erstelle neuen Service für diesen User
    const context = canvasElement.getContext('2d');
    if (!context) {
      console.warn(`[ChatroomComponent] Failed to get context for user ${userId}`);
      return null;
    }

    // Dimensioniere Canvas auf die ListItem-Größe
    const parentElement = canvasElement.parentElement;
    if (parentElement) {
      const rect = parentElement.getBoundingClientRect();
      canvasElement.width = Math.max(1, Math.floor(rect.width));
      canvasElement.height = Math.max(1, Math.floor(rect.height));
      console.log(`[ChatroomComponent] Canvas for user ${userId} sized to ${canvasElement.width}x${canvasElement.height}`);
    }

    const service = new FeatureService();
    service.initialize(canvasElement, context);
    this.userFeatureServices.set(userId, service);

    console.log(`[ChatroomComponent] Created user feature service for user ${userId}`);
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
    const selectedUsers = items
      .map(item => this.users().find(u => u.username === item.label))
      .filter((u): u is User => u !== undefined);

    this.selectedUsers.set(selectedUsers);
  }

  onChatroomSelect(type: string, item: ListItem): void {
    this.chatroomSelect.emit({ type, item });
  }

  addFeature(type: string): void {
    const featureType = type.toUpperCase() as FeatureType;
    if (Object.values(FeatureType).includes(featureType)) {
      // Nur hinzufügen, wenn noch nicht vorhanden
      if (!this.featureService.hasFeature(featureType)) {
        this.featureService.addFeature(featureType);
        this.featureService.startAnimation();
      }
      console.log(`[ChatroomComponent] Feature "${type}" added`);
    } else {
      console.warn(`[ChatroomComponent] Unknown feature type: ${type}`);
    }
  }

  addUserFeature(type: string, userId: string): void {
    console.log(`\n========== [addUserFeature] START ==========`);
    console.log(`Type: ${type}, UserId: ${userId}`);
    console.log(`Users in component:`, this.users().map(u => u.username));

    const featureType = type.toUpperCase();

    const user = this.users().find(u => u.username === userId || String(u.id) === userId);
    if (!user) {
      console.warn(`[addUserFeature] User not found: ${userId}`);
      return;
    }
    console.log(`[addUserFeature] Found user:`, user.username);

    // Use the component's ownerDocument
    const doc = this.elementRef.nativeElement.ownerDocument;
    console.log(`[addUserFeature] Doc location:`, (doc as any).location?.href || 'frame document');

    const userListContainer = doc.querySelector('aside ui-list');
    console.log(`[addUserFeature] Container found:`, !!userListContainer);

    if (!userListContainer) {
      console.warn(`[addUserFeature] User list container not found`);
      console.log(`[addUserFeature] All ui-list elements:`, doc.querySelectorAll('ui-list').length);
      return;
    }

    console.log(`[addUserFeature] Container HTML length:`, (userListContainer as any).innerHTML?.length || 0);
    const html = (userListContainer as any).innerHTML || '';
    console.log(`[addUserFeature] Container has content:`, html.length > 0);
    if (html.length > 0) {
      console.log(`[addUserFeature] First 500 chars:`, html.substring(0, 500));
    }

    let listItem: HTMLElement | null = null;
    const listItems = userListContainer.querySelectorAll('.list-item');
    console.log(`[addUserFeature] Found ${listItems.length} .list-item elements`);

    // Try to find in the entire document as fallback
    if (listItems.length === 0) {
      console.log(`[addUserFeature] No .list-item found in container, trying entire doc`);
      const allItems = doc.querySelectorAll('.list-item');
      console.log(`[addUserFeature] Total .list-item in doc:`, allItems.length);
      allItems.forEach((item: Element, idx: number) => {
        const label = item.querySelector('.label');
        console.log(`[addUserFeature] Item ${idx}: "${label?.textContent?.trim()}"`);
      });
    }

    for (const item of listItems) {
      const label = item.querySelector('.label');
      const labelText = label?.textContent?.trim();
      console.log(`[addUserFeature] Checking: "${labelText}" vs "${user.username}"`);
      if (labelText === user.username) {
        listItem = item as HTMLElement;
        break;
      }
    }

    if (!listItem) {
      console.warn(`[addUserFeature] User list item not found for: ${user.username}`);
      return;
    }

    console.log(`[addUserFeature] FOUND item for ${user.username}, applying ${featureType}`);

    if (featureType === 'BURN') {
      console.log(`[addUserFeature] Initializing BURN feature for`, listItem);
      const burnFeature = new ListBurnFeature();
      const dummyCanvas = document.createElement('canvas');
      burnFeature.onInit(dummyCanvas, null as any, listItem);
      burnFeature.onStart();
      console.log(`[addUserFeature] Starting BURN animation`);
      // Start animation loop for this user feature
      this.startUserFeatureAnimation(user.username, burnFeature);
      console.log(`[addUserFeature] BURN feature applied`);
    } else if (featureType === 'GLOW') {
      console.log(`[addUserFeature] Initializing GLOW feature for`, listItem);
      const glowFeature = new ListGlowFeature();
      const dummyCanvas = document.createElement('canvas');
      glowFeature.onInit(dummyCanvas, null as any, listItem);
      glowFeature.onStart();
      console.log(`[addUserFeature] Starting GLOW animation`);
      // Start animation loop for this user feature
      this.startUserFeatureAnimation(user.username, glowFeature);
      console.log(`[addUserFeature] GLOW feature applied`);
    }
  }

  removeFeature(type: string): void {
    const featureType = type.toUpperCase();
    this.featureService.removeFeature(featureType);

    if (!this.featureService.hasFeature(FeatureType.SNOW)) {
      this.featureService.stopAnimation();
    }
  }

  removeAllFeatures(): void {
    this.featureService.removeAllFeatures();
    this.featureService.stopAnimation();
  }

  hasFeature(type: string): boolean {
    const featureType = type.toUpperCase();
    return this.featureService.hasFeature(featureType);
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
    switch (message.type) {
      case ChatMessageType.ACTION:
        return message.message ?? '';
      case ChatMessageType.PUBLIC:
        return `${message.getUsername()}: ${message.message}`;
      case ChatMessageType.PRIVATE: {
        let target = '';
        if (message.user && message.users) {
          target = ' an ' + message.users.map(entry =>
            `<span data-action="profile:${entry.username}">${entry.username}</span>`
          ).join(', ');
        }
        return `${message.getUsername()} (privat${target}): ${message.message}`;
      }
    }
  }
}
