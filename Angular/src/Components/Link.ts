import {Component, Input, Output, EventEmitter, ElementRef, forwardRef, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

export enum LinkTarget {
  POPUP   = 'p',
  DEFAULT = 'd',
  NEW     = 'n'
}

@Component({
  selector: 'ui-link',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Link),
      multi: true
    }
  ],
  template: `<a [attr.href]="url || null" [class.action]="!!action" (click)="onClick($event)"><ng-content /></a>`,
  styles: [`
   :host a {
      cursor: pointer;
      position: relative;
      display: inline-block;
      text-decoration: none;
      color: var(--room-blue);
    }

   :host a::after {
      content: "";
      background: var(--room-blue);
      position: absolute;
      left: 0;
      right: 0;
      bottom: 3px;
      height: 1px;
    }

   :host a:hover {
      color: var(--room-foreground);
    }

   :host a::after:hover {
     background: var(--room-foreground);
   }
  `]
})
export class Link implements ControlValueAccessor, OnInit {
  @Input() url: string = '';
  @Input() target: LinkTarget = LinkTarget.DEFAULT;
  @Input() action: string = '';
  @Output() command = new EventEmitter<string>();

  constructor(private hostRef: ElementRef<HTMLElement>) {}

  private onChangeFn = (value: string) => {};
  private onTouchedFn = () => {};

  ngOnInit(): void {
    if(!this.action) {
      const dataAction = this.hostRef.nativeElement.getAttribute('data-action');

      if(dataAction) {
        this.action = dataAction;
      }
    }

    if(!this.url) {
      const urlAttr = this.hostRef.nativeElement.getAttribute('url');

      if(urlAttr) {
        this.url = urlAttr;
      }
    }
  }

  writeValue(value: string): void {
    this.url = value;
  }

  registerOnChange(fn: any): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedFn = fn;
  }

  onChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.onTouchedFn();
  }

  onClick(event: MouseEvent): void {
    if(this.action.length > 0) {
      event.preventDefault();

      this.command.emit(this.action);

      this.hostRef.nativeElement.dispatchEvent(new CustomEvent('ui-command', {
        detail:   this.action,
        bubbles:  true,
        composed: true
      }));

      return;
    }

    if(this.url.length === 0) {
      event.preventDefault();
      return;
    }

    if(this.target === LinkTarget.DEFAULT) {
      return;
    }

    event.preventDefault();

    if(this.target === LinkTarget.NEW) {
      window.open(this.url, '_blank');
    } else if (this.target === LinkTarget.POPUP) {
      const width = 600;
      const height = 400;
      const left = (window.innerWidth - width) / 2;
      const top = (window.innerHeight - height) / 2;

      window.open(
        this.url,
        'popup',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
      );
    }
  }
}
