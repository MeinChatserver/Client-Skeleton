import {Component, Input, forwardRef, ViewChild, ElementRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'ui-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Calendar),
      multi: true
    }
  ],
  template: `
    <input #inputRef type="date"
      [value]="value"
      [min]="minDate"
      [max]="maxDate"
      (change)="onChange($event)"
      [disabled]="disabled" />`,
  styles: [`
    :host {
      margin: 1px;
    }

    input {
      width: 100%;
      font-size: 16px;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }`]
})
export class Calendar implements ControlValueAccessor {
  @ViewChild('inputRef') inputRef?: ElementRef<HTMLInputElement>;
  @Input() format: string = 'yyyy-MM-dd';
  @Input() minDate?: string;
  @Input() maxDate?: string;

  value: string = '';
  disabled = false;

  private onChangeFn = (value: any) => {};
  private onTouchedFn = () => {};

  getValue(): string {
    return this.inputRef?.nativeElement.value ?? '';
  }

  setValue(val: string): void {
    if (this.inputRef) {
      this.inputRef.nativeElement.value = val;
    }
    this.value = val;
  }

  writeValue(value: any): void {
    this.value = value || '';
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
    this.value = target.value;
    this.onChangeFn(this.value);
    this.onTouchedFn();
  }
}
