import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'ui-line',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="ui-line"></div>`,
  styles: [`
    :host {
      display: block;
      margin: 1px;
    }

    .ui-line {
      width: 100%;
      border: none;
      border-top: var(--line-thickness, 1px) var(--line-style, solid) var(--line-color, #ccc);
      height: 0;
    }`]
})
export class Line {
  @Input() style: string = 'solid';
  @Input() thickness: number = 1;
  @Input() color: string = '#ccc';
  @Input() margin: number = 10;

  get hostStyle() {
    return {
      '--line-style': this.style,
      '--line-thickness': `${this.thickness}px`,
      '--line-color': this.color,
      'margin': `${this.margin}px 0`
    };
  }
}
