import { ApplicationRef, ComponentRef, EnvironmentInjector } from '@angular/core';
import { Frame, FrameConfig } from './Frame';
import { ChatroomComponent, CHATROOM_STYLES } from './ChatroomComponent';
import { Client } from './Client';
import { ChatMessage, ChatMessageType } from './ChatMessage';
import { User } from './Models';
export { ChatMessage, ChatMessageType } from './ChatMessage';

export interface ChatroomConfig extends FrameConfig {
  roomName?: string;
  username?: string;
}

export class ChatroomFrame extends Frame {
  protected roomName: string;
  protected messages: ChatMessage[] = [];
  protected users: User[] = [];
  protected style: any = null;
  protected eventListeners: Map<string, Function[]> = new Map();

  constructor(
    config: ChatroomConfig,
    appRef: ApplicationRef,
    injector: EnvironmentInjector,
    protected client: Client
  ) {
    super({
      ...config,
      width:      config.width || 800,
      height:     config.height || 600,
      resizable:  true,
      scrollbars: false
    }, appRef, injector);

    this.roomName = config.roomName || 'Chat';

    this.renderContent();
  }

  protected override renderContent(): void {
    this.applyStyle();

    if(this.frameDocument && !this.frameDocument.getElementById('chatroom-styles')) {
      const style = this.frameDocument.createElement('style');
      style.id                    = 'chatroom-styles';
      style.textContent           = CHATROOM_STYLES.replace(':host', 'body');
      this.frameDocument.head.appendChild(style);
    }

    const ref = this.renderComponent(ChatroomComponent, {
      client:   this.client,
      roomName: this.roomName
    }) as ComponentRef<ChatroomComponent> | null;

    if(!ref) {
      return;
    }

    const instance = ref.instance as ChatroomComponent;

    instance.initMessages(this.messages);
    instance.setUsers(this.users);
    instance.sendMessage.subscribe((msg: string) => this.emit('sendMessage', msg));
    instance.chatroomSelect.subscribe(({ type, item }: { type: string; item: any }) =>
      this.emit('chatroomSelect', { type, item })
    );

    ref.changeDetectorRef.detectChanges();
  }

  public addMessage(message: ChatMessage): void {
    this.messages.push(message);

    if(this.componentRef) {
      (this.componentRef.instance as ChatroomComponent).addMessage(message);
    }
  }

  public clearMessages(): void {
    this.messages = [];

    if(this.componentRef) {
      (this.componentRef.instance as ChatroomComponent).clearMessages();
    }

    this.emit('messages-cleared');
  }

  public setUsers(users: User[] | null): void {
    if(users !== null) {
      this.users = [...users];
    }

    if(this.componentRef) {
      (this.componentRef.instance as ChatroomComponent).setUsers(this.users);
    }
  }

  public addUser(user: User): void {
    if(!this.users.some(u => u.id === user.id)) {
      this.users.push(user);
    }

    if(this.componentRef) {
      (this.componentRef.instance as ChatroomComponent).addUser(user);
    }
  }

  public removeUser(user: User): void {
    this.users = this.users.filter(entry => entry.id !== user.id);

    if(this.componentRef) {
      (this.componentRef.instance as ChatroomComponent).removeUser(user);
    }
  }

  public setStyle(style: any): void {
    this.style = style;
    this.applyStyle();
  }

  protected applyStyle(): void {
    if (!this.style || !this.frameDocument) {
      return;
    }

    const vars: string[]  = [];
    const bg         = this.style.background;
    const output     = this.style.output;
    const ranks      = this.style.ranks;

    if(bg?.color) {
      vars.push(`--room-background: ${bg.color};`);
    }

    if(bg?.image?.file) {
      vars.push(`--room-background-image: url('https://${this.client.getHostname()}${bg.image.file}');`);
    }

    if(output?.blue) {
      vars.push(`--room-blue: ${output.blue};`);
    }

    if(output?.red) {
      vars.push(`--room-red: ${output.red};`);
    }

    if(output?.green) {
      vars.push(`--room-green: ${output.green};`);
    }

    if(output?.default) {
      vars.push(`--room-foreground: ${output.default};`);
    }

    if(ranks?.enabled) {
      Object.entries(ranks).forEach(([key, value]) => {
        if(key !== 'enabled' && typeof value === 'string') {
          vars.push(`--room-rank-${key}: ${value};`);
        }
      });
    }

    if(vars.length === 0) {
      return;
    }

    let element = this.frameDocument.getElementById('chatroom-theme') as HTMLStyleElement | null;

    if(!element) {
      element    = this.frameDocument.createElement('style');
      element.id = 'chatroom-theme';
      this.frameDocument.head.appendChild(element);
    }

    element.textContent = `:root { ${vars.join(' ')} }`;
  }

  public addFeature(type: string): void {
    if(this.componentRef) {
      (this.componentRef.instance as ChatroomComponent).addFeature(type);
    }
  }

  public addUserFeature(type: string, userId: string): void {
    if(this.componentRef) {
      (this.componentRef.instance as ChatroomComponent).addUserFeature(type, userId);
    }
  }

  public removeFeature(type: string): void {
    if(this.componentRef) {
      (this.componentRef.instance as ChatroomComponent).removeFeature(type);
    }
  }

  public removeAllFeatures(): void {
    if(this.componentRef) {
      (this.componentRef.instance as ChatroomComponent).removeAllFeatures();
    }
  }

  public hasFeature(type: string): boolean {
    if(this.componentRef) {
      return (this.componentRef.instance as ChatroomComponent).hasFeature(type);
    }

    return false;
  }

  public getSelectedUsers(): User[] {
    if(this.componentRef) {
      return (this.componentRef.instance as ChatroomComponent).getSelectedUsers();
    }

    return [];
  }

  public setConnected(connected: boolean): void {
    if(this.componentRef) {
      (this.componentRef.instance as ChatroomComponent).setConnected(connected);
    }
  }

  public on(eventName: string, callback: Function): void {
    if(!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }

    this.eventListeners.get(eventName)!.push(callback);
  }

  public off(eventName: string, callback?: Function): void {
    if(!callback) {
      this.eventListeners.delete(eventName);
      return;
    }

    const listeners = this.eventListeners.get(eventName);

    if(listeners) {
      const index = listeners.indexOf(callback);

      if(index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  protected emit(eventName: string, data?: any): void {
    const listeners = this.eventListeners.get(eventName);

    if(listeners) {
      listeners.forEach(callback => callback(data));
    }
  }
}
