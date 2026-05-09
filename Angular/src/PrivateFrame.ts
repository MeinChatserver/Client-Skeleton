import { ApplicationRef, ComponentRef, EnvironmentInjector } from '@angular/core';
import { Frame, FrameConfig } from './Frame';
import { PrivateComponent, PRIVATE_STYLES } from './PrivateComponent';
import { MESSAGE_INPUT_STYLES } from './Components/MessageInput';
import { Client } from './Client';
import { ChatMessage } from './ChatMessage';

export interface PrivateConfig extends FrameConfig {
  targetUsername?: string;
}

export class PrivateFrame extends Frame {
  protected targetUsername: string;
  protected messages: ChatMessage[] = [];
  protected eventListeners: Map<string, Function[]> = new Map();

  constructor(
    config: PrivateConfig,
    appRef: ApplicationRef,
    injector: EnvironmentInjector,
    protected client: Client
  ) {
    super({
      ...config,
      width:      config.width || 500,
      height:     config.height || 400,
      resizable:  true,
      scrollbars: false
    }, appRef, injector);

    this.targetUsername = config.targetUsername || '';

    this.renderContent();
  }

  protected override renderContent(): void {
    if(this.frameDocument && !this.frameDocument.getElementById('private-styles')) {
      const style = this.frameDocument.createElement('style');
      style.id          = 'private-styles';
      style.textContent = PRIVATE_STYLES;
      this.frameDocument.head.appendChild(style);
    }

    if(this.frameDocument && !this.frameDocument.getElementById('message-input-styles')) {
      const style = this.frameDocument.createElement('style');
      style.id          = 'message-input-styles';
      style.textContent = MESSAGE_INPUT_STYLES;
      this.frameDocument.head.appendChild(style);
    }

    const ref = this.renderComponent(PrivateComponent, {
      client:   this.client,
      frame:    this
    }) as ComponentRef<PrivateComponent> | null;

    if(!ref) {
      return;
    }

    const instance = ref.instance as PrivateComponent;

    instance.initMessages(this.messages);
    instance.sendMessage.subscribe((msg: string) => this.emit('sendMessage', msg));

    ref.changeDetectorRef.detectChanges();
  }

  public getTargetUsername(): string {
    return this.targetUsername;
  }

  public getRoomName(): string {
    return this.targetUsername;
  }

  public addMessage(message: ChatMessage): void {
    this.messages.push(message);

    if(this.componentRef) {
      (this.componentRef.instance as PrivateComponent).addMessage(message);
    }
  }

  public clearMessages(): void {
    this.messages = [];

    if(this.componentRef) {
      (this.componentRef.instance as PrivateComponent).clearMessages();
    }
  }

  public on(event: string, callback: Function): void {
    if(!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }

    this.eventListeners.get(event)?.push(callback);
  }

  public emit(event: string, ...args: any[]): void {
    const listeners = this.eventListeners.get(event);

    if(listeners) {
      listeners.forEach(callback => callback(...args));
    }
  }
}
