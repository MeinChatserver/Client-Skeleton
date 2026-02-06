import {Component} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-panel',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content />`,
  styles: [`
    :host {
      flex: 1;
      height: 100%;
      min-height: 0;
      overflow-x: hidden;
      overflow-y: auto;
      display: block;
      position: relative;
      background: #FFFFFF;
      border-top: 1px solid #808080;
      border-left: 1px solid #808080;
      border-right: 1px solid #CACACA;
      border-bottom: 1px solid #9F9F9F;
    }

    :host::before {
      content: "";
      position: sticky;
      display: block;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1;
      width: 100%;
      pointer-events: none;
      border-top: 1px solid #000000;
      border-left: 1px solid #000000;
      overflow: hidden;
    }
  `]
})
export class Panel {

}
