import {computed, Component, OnInit, Input, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Client } from './Client';
import { Select, Textfield, CheckBox, Button, List, Label, Panel, Link } from './Components';
import {Category, ListItem} from './Models';
import {CategoryChange, ChatroomInfo} from './Models/Network';
import {LinkTarget} from './Components/Link';

@Component({
  selector: 'ui-login',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, FormsModule, Select, Textfield, CheckBox, Button, List, Label, Panel, Link],
  template: `
    <form>
      <ui-form>
          @if(client.isEmbedded) {
              <ui-label name="category" text="Kategorie" [dotted]="true" />
              <ui-select name="category" [(ngModel)]="selectedCategory" [options]="categories" valueKey="id" labelKey="name"></ui-select>

              <ui-label name="username" text="Benutzername" [dotted]="true" />
              <ui-input name="username" [(ngModel)]="username" (keydown.enter)="focusNext('ui-input[name=password]', $event)" />
              <ui-label name="password" text="Passwort" [dotted]="true" />
              <ui-input name="password" [(ngModel)]="password" [password]="true" (keydown.enter)="focusNext('ui-button', $event)" />
              <ui-label name="chatroom" text="Chatraum" [dotted]="true" />
              <ui-input name="chatroom" [(ngModel)]="chatroom" />

              <div id="remember_container">
                <ui-check name="remember" [(ngModel)]="remember" /> <ui-label for="remember" text="Passwort merken" />
              </div>

               <ui-button (click)="onLoginClick()" [disabled]="!canLogin()" text="{{ getButtonText() }}" />
          } @else {
            <h1 name="logo">
              <i class="bi bi-cloud-fill"></i>&nbsp;<span>Mein Chatserver</span>
            </h1>

            <ui-container>
              <ui-label name="username" text="Benutzername" [dotted]="true" />
              <ui-input name="username" [(ngModel)]="username" (keydown.enter)="focusNext('ui-input[name=password]', $event)" />
              <ui-label name="password" text="Passwort" [dotted]="true" />
              <ui-input name="password" [(ngModel)]="password" [password]="true" autocomplete="current-password" (keydown.enter)="focusNext('ui-button', $event)" />

              <div id="remember_container">
                <ui-check name="remember" [(ngModel)]="remember" /> <ui-label for="remember" text="Passwort merken" />
              </div>

              <div id="links">
                <ui-link url="">Passwort vergessen?</ui-link> <ui-link url="https://demo.mein-chatserver.de/Register" [target]="LinkTarget.POPUP">Neu registrieren</ui-link>
              </div>
            </ui-container>

            <ui-label name="category" text="Kategorie" [dotted]="true" />
            <ui-select name="category" [(ngModel)]="selectedCategory" [options]="categories" valueKey="id" labelKey="name"></ui-select>
            <ui-label name="chatroom" text="Chatraum" [dotted]="true" />
            <ui-input name="chatroom" [(ngModel)]="chatroom" />
          }
      </ui-form>
    </form>
    <aside>
      @if(this.client.connectionStatus === 'connecting') {
        <ui-panel class="connecting">
          <ui-label name="connecting" text="Verbinde" />
        </ui-panel>
      } @else {
        <ui-list [items]="chatrooms()" (itemClick)="onChatroomSelect('left', $event)" (itemRightClick)="onChatroomSelect('right', $event)">></ui-list>
      }
    </aside>
    @if(!client.isEmbedded) {
      <footer>
          <ui-button (click)="onLoginClick()" [disabled]="!canLogin()" text="{{ getButtonText() }}" />
      </footer>
    }
  `,
  styles: [`
    :host {
      display: flex;
    }

    /* Login-Form */
    ui-form {
      flex: 1;
      padding: 10px;
      display: grid;
      grid-template-columns: auto 1fr;
      grid-template-rows: 1fr auto auto auto auto;
      grid-template-areas:
        ". ."
        "logo logo"
        "account account"
        "category_label category_element"
        "chatroom_label chatroom_element";
    }

    ui-form [name="logo"] {
      grid-area: logo;
      text-align: center;
      margin-bottom: 40px;
    }

    ui-form ui-container {
      grid-area: account;
      flex: 1;
      display: grid;
      padding: 0 25px;
      grid-template-columns: auto 1fr;
      grid-template-rows: 1fr auto auto;
      grid-template-areas:
        "username_label username_element"
        "password_label password_element"
        ". remember"
        "links links"
    }

    ui-form ui-label[name="username"] {
      grid-area: username_label;
    }

    ui-form ui-label[name="username"],
    ui-form ui-label[name="password"] {
      text-align: right;
    }

    ui-form ui-input[name="username"] {
      grid-area: username_element;
    }

    ui-form ui-label[name="password"] {
      grid-area: password_label;
    }

    ui-form ui-input[name="password"] {
      grid-area: password_element;
    }

    ui-form div#remember_container {
      grid-area: remember;
      display: block;
      padding: 5px 0;
    }

    ui-form div#links {
      grid-area: links;
      text-align: center;
      display: block;
      padding: 5px 0 20px 0;
      white-space: nowrap;
    }

    ui-form ui-label[name="category"] {
      grid-area: category_label;
    }

    ui-form ui-select[name="category"] {
      grid-area: category_element;
    }

    ui-form ui-label[name="chatroom"] {
      grid-area: chatroom_label;
    }

    ui-form  ui-input[name="chatroom"] {
      grid-area: chatroom_element;
    }

    ui-form ui-button {
      grid-area: button;
    }

    /* Chatroom List */
    aside {
      flex: 1;
      width: 100%;
      min-height: 0;
    }

    aside .connecting {
      text-align: center;
      color: #FFFFFF;
      text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;
    }

    aside ui-label[name="connecting"]::after {
      content: "";
      display: inline-block;
      width: 5px;
      animation: dots 3s linear infinite;
      text-align: left;
    }

    footer {
      padding: 15px 0;
    }
  `]
})
export class Login implements OnInit {
  @Input() client!: Client;
  username: string = '';
  password: string = '';
  chatroom: string = '';
  remember: boolean = false;
  private _selectedCategory: number | null = null;
  get selectedCategory(): number | null { return this._selectedCategory; }
  set selectedCategory(value: number | null) {
    this._selectedCategory = value;
    this.client.send(new CategoryChange(value));
  }

  categories: Category[] = [];
  chatrooms = computed(() =>
    this.client.chatRooms().filter(room => room.getName() !== null).map((room): ListItem => ({
      label: room.getName() ?? '',
      number: room.getUserCount()
    }))
  );

  ngOnInit() {}

  onChatroomSelect(type: string, item: ListItem): void {
    switch(type) {
      case 'left':
        this.chatroom = item.label;
      break;
      case 'right':
        this.client.send(new ChatroomInfo(item.label));
      break;
    }
  }

  onLoginClick(): void {
    if(!this.canLogin()) {
      return;
    }

    this.client.send({
      operation: 'LOGIN',
      data: {
        username: this.username,
        password: this.password,
        chatroom: this.chatroom
      }
    });
  }

  canLogin(): boolean {
    return this.client.connectionStatus !== 'connecting';
  }

  getButtonText(): string {
    if(this.client.connectionStatus == 'connecting') {
      return 'Verbinde...';
    }

    if(this.client.connectionStatus !== 'connected') {
      return 'Nicht verbunden';
    }

    return 'Einloggen';
  }

  focusNext(selector: string, event: Event): void {
    event.preventDefault();

    const target = event.target as HTMLElement;
    const form = target.closest('ui-form')?.parentElement || document.body;
    const next = form.querySelector<HTMLElement>(selector);

    if (!next) {
      console.warn(`No element found for selector: ${selector}`, form);
      return;
    }

    if (next.tagName === 'UI-BUTTON' || next.tagName === 'BUTTON') {
      next.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true
      }));
    } else {
      const innerInput = next.querySelector('input, textarea, select') as HTMLInputElement;

      if (innerInput) {
        innerInput.focus();
        innerInput.select?.();
      } else {
        next.focus();
      }
    }
  }

  protected readonly LinkTarget = LinkTarget;
}
