import {Component, Input, Output, EventEmitter, ViewChild, ElementRef, forwardRef, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'ui-message-input',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MessageInput),
      multi: true
    }
  ],
  template: `
    <input #inputRef [type]="password ? 'password' : 'text'"
      [value]="value"
      [placeholder]="placeholder"
      [autocomplete]="autocomplete"
      (change)="onChange($event)"
      (keydown)="onKeyDown($event)"
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
export class MessageInput implements ControlValueAccessor {
  @ViewChild('inputRef') inputRef?: ElementRef<HTMLInputElement>;
  @Input() autocomplete: string               = 'off';
  @Input() placeholder: string                = '';
  @Input() password: boolean                  = false;
  @Input() maxHistorySize: number             = 50;
  @Output() historyNavigate  = new EventEmitter<string>();

  value: any                                  = '';
  disabled                            = false;

  private onChangeFn          = (value: any) => {};
  private onTouchedFn                = () => {};
  private history: string[]                   = [];
  private historyIndex: number                = -1;

  getValue(): string {
    return this.inputRef?.nativeElement.value ?? '';
  }

  setValue(val: string): void {
    if(this.inputRef) {
      this.inputRef.nativeElement.value = val;
    }

    this.value = val;
  }

  onKeyDown(event: KeyboardEvent): void {
    if(event.key === 'ArrowUp') {
      event.preventDefault();
      this.navigateHistoryUp();
    } else if(event.key === 'ArrowDown') {
      event.preventDefault();
      this.navigateHistoryDown();
    }
  }

  onEnter(): void {}

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(callback: any): void {
    this.onChangeFn = callback;
  }

  registerOnTouched(callback: any): void {
    this.onTouchedFn = callback;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onChange(event: Event): void {
    const target  = event.target as HTMLInputElement;
    this.value    = target.value;

    this.onChangeFn(this.value);
    this.onTouchedFn();
  }

  sendMessage(): void {
    const message = this.getValue().trim();

    if(message) {
      this.addToHistory(message);
    }

    this.setValue('');
    this.historyIndex = -1;
  }

  private navigateHistoryUp(): void {
    if(this.history.length === 0) {
      return;
    }

    if(this.historyIndex === -1) {
      this.historyIndex = this.history.length - 1;
    } else if(this.historyIndex > 0) {
      this.historyIndex--;
    }

    const message = this.history[this.historyIndex];
    this.setValue(message);
    this.historyNavigate.emit(message);
  }

  private navigateHistoryDown(): void {
    if(this.history.length === 0 || this.historyIndex === -1) {
      return;
    }

    if(this.historyIndex < this.history.length - 1) {
      const message = this.history[++this.historyIndex];

      this.setValue(message);
      this.historyNavigate.emit(message);
    } else {
      this.historyIndex = -1;
      this.setValue('');
    }
  }

  private addToHistory(message: string): void {
    if(this.history.length > 0 && this.history[this.history.length - 1] === message) {
      return;
    }

    this.history.push(message);

    if(this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  getHistory(): string[] {
    return [...this.history];
  }

  clearHistory(): void {
    this.history      = [];
    this.historyIndex = -1;
  }
}
