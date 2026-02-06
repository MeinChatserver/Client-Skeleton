import {Component, Input, forwardRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'ui-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Select),
      multi: true
    }
  ],
  template: `
    <select
      [value]="value"
      (change)="onChange($event)"
      [disabled]="disabled">
      <option [value]="null" *ngIf="placeholder">{{ placeholder }}</option>
      <option *ngFor="let option of options" [value]="option[valueKey]">
        {{ option[labelKey] }}
      </option>
    </select>`,
  styles: [`:host {
    width: 100%;
  }

  select {
    width: 100%;
  }`]
})
export class Select implements ControlValueAccessor {
  @Input() options: any[] = [];
  @Input() valueKey: string = 'id';
  @Input() labelKey: string = 'name';
  @Input() placeholder: string = '';

  value: any = null;
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
