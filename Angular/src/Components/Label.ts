import {Component, Input, forwardRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'ui-label',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Label),
      multi: true
    }
  ],
  template: `<label for="{{ for }}">{{ text }}{{ dotted ? ':' : ''}}</label>`,
  styles: [`
    :host {
      padding: 0 20px 0 0;
    }

    label[for] {
      cursor: pointer;
    }
  `]
})
export class Label implements ControlValueAccessor {
  @Input() name: string = '';
  @Input() text: string = '';
  @Input() for: string = '';
  @Input() dotted: boolean = false;

  private onChangeFn = (value: string) => {};
  private onTouchedFn = () => {};

  writeValue(value: string): void {
    this.text = value;
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
}
