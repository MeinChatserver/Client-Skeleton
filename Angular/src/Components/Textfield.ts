import {Component, Input, forwardRef, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'ui-input',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Textfield),
      multi: true
    }
  ],
  template: `
    <input type="text"
      [value]="value"
      [placeholder]="placeholder"
      (change)="onChange($event)"
      [disabled]="disabled" />`,
  styles: [`
    :host {
      margin: 1px;
    }

    input {
      width: 100%;
      font-size: 16px;
    }`]
})
export class Textfield implements ControlValueAccessor {
  @Input() placeholder: string = '';

  value: any;
  disabled = false;

  private onChangeFn = (value: any) => {};
  private onTouchedFn = () => {};

  writeValue(value: any): void {
    this.value = value;
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
    const target = event.target as HTMLSelectElement;
    this.value = target.value;
    this.onChangeFn(this.value);
    this.onTouchedFn();
  }
}
