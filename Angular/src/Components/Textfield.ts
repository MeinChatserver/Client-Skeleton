import {Component, Input, forwardRef, CUSTOM_ELEMENTS_SCHEMA, ViewChild, ElementRef} from '@angular/core';
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
    <input #inputRef [type]="password ? 'password' : 'text'"
      [value]="value"
      [placeholder]="placeholder"
      [autocomplete]="autocomplete"
      (change)="onChange($event)"
      (keydown.enter)="onEnter()"
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
  @ViewChild('inputRef') inputRef?: ElementRef<HTMLInputElement>;
  @Input() autocomplete: string = 'off';
  @Input() placeholder: string = '';
  @Input() password: boolean = false;

  value: any = '';
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

  onEnter(): void {
    // Enter key handler
  }

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
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChangeFn(this.value);
    this.onTouchedFn();
  }
}
