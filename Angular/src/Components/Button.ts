import {Component, Input, forwardRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Button),
      multi: true
    }
  ],
  template: `<button (change)="onChange($event)" [disabled]="disabled">{{ text }}</button>`,
  styles: [`
    :host {
      display: flex;
      flex: 1 1 auto;
    }

    button {
      flex: 1;
      width: 100%;
      height: 100%;
    }`]
})
export class Button implements ControlValueAccessor {
  @Input() text: string = '';

  checked: boolean = false;
  disabled: boolean = false;

  private onChangeFn = (value: boolean) => {};
  private onTouchedFn = () => {};

  writeValue(value: boolean): void {
    this.checked = value;
  }

  registerOnChange(fn: any): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.checked = target.checked;
    this.onChangeFn(this.checked);
    this.onTouchedFn();
  }
}
