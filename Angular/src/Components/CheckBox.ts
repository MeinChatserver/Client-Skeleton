import {Component, Input, forwardRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'ui-check',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckBox),
      multi: true
    }
  ],
  template: `
      <input
        type="checkbox"
        name="{{ name }}"
        [checked]="checked"
        (change)="onChange($event)"
        [disabled]="disabled" />`,
  styles: [`:host {
    margin: 1px;
    display: inline-flex;
    vertical-align: middle;
  }

  input {
    width: 14px;
    height: 14px;
  }`]
})
export class CheckBox implements ControlValueAccessor {
  @Input() name: string = '';
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
