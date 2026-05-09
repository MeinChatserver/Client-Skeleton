import { ApplicationRef, ComponentRef, EnvironmentInjector } from '@angular/core';
import { Frame, FrameConfig } from './Frame';
import { PrivateComponent, PRIVATE_STYLES } from './PrivateComponent';
import { MESSAGE_INPUT_STYLES } from './Components/MessageInput';
import { Client } from './Client';
import { ChatMessage } from './ChatMessage';
import { RoomStyle } from './Models';

export interface PrivateConfig extends FrameConfig {
  targetUsername?: string;
}

export class PrivateFrame extends Frame {
  protected targetUsername: string;
  protected messages: ChatMessage[] = [];
  protected style: RoomStyle | null = null;
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

  public setStyle(style: RoomStyle | null): void {
    this.style = style;
    this.applyStyle();
  }

  protected applyStyle(): void {
    if(!this.style || !this.frameDocument) {
      return;
    }

    const vars: string[] = [];
    const bg     = this.style.getBackground();
    const output = this.style.getOutput();
    const ranks  = this.style.getRanks();

    if(bg?.getColor()) {
      vars.push(`--room-background: ${bg.getColor()};`);
    }

    // Achtung: KEIN background-image (Vorgabe)

    if(output?.getBlue()) {
      vars.push(`--room-blue: ${output.getBlue()};`);
    }

    if(output?.getRed()) {
      vars.push(`--room-red: ${output.getRed()};`);
    }

    if(output?.getGreen()) {
      vars.push(`--room-green: ${output.getGreen()};`);
    }

    if(output?.getDefault()) {
      vars.push(`--room-foreground: ${output.getDefault()};`);
    }

    /*
    if(ranks?.isEnabled()) {
      ranks.getAllColors().forEach((color, rankId) => {
        vars.push(`--rank_${rankId}: ${color};`);
      });
    }*/

    if(vars.length === 0) {
      return;
    }

    let element = this.frameDocument.getElementById('private-theme') as HTMLStyleElement | null;

    if(!element) {
      element    = this.frameDocument.createElement('style');
      element.id = 'private-theme';
      this.frameDocument.head.appendChild(element);
    }

    element.textContent = `:root { ${vars.join(' ')} }`;
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
