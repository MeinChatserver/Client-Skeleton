import {Component, Input, forwardRef} from '@angular/core';
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
  template: `<a [href]="url" (click)="onClick($event)"><ng-content /></a>`,
  styles: [`
    a {
      cursor: pointer;
      text-decoration: underline;
    }
  `]
})
export class Link implements ControlValueAccessor {
  @Input() url: string = '';
  @Input() target: LinkTarget = LinkTarget.DEFAULT;

  private onChangeFn = (value: string) => {};
  private onTouchedFn = () => {};

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
