// scrollable-list.component.ts
import {Component, EventEmitter, Input, Output} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ListItem} from '../Models/ListItem';

@Component({
  selector: 'ui-list',
  standalone: true,
  imports: [CommonModule],
  template: `
      <div
        *ngFor="let item of items"
        class="list-item"
        [class.active]="item === selectedItem"
        (click)="onItemClick($event, item)"
        (contextmenu)="onItemRightClick($event, item)">

        <i *ngIf="item.prefixIcon" [class]="item.prefixIcon" class="prefix-icon"></i>

        <span class="label">{{ item.label }}</span>

        <small class="count">({{ item.count }})</small>

        <i *ngIf="item.suffixIcon" [class]="item.suffixIcon" class="suffix-icon"></i>
      </div>
  `,
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

    .list-item {
      padding: 3px 10px;
      cursor: pointer;
      border-bottom: 1px solid transparent;
    }

    .list-item:last-child {
      border-bottom: none;
    }

    .list-item:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .list-item.active {
      background: rgba(0, 0, 128, 0.8);
      color: #FFFFFF;
    }

    .prefix-icon {
      margin-right: 8px;
      color: #666;
    }

    .label {
      font-size: 14px;
    }

    .count {
      color: #999999;
      font-size: 12px;
      margin-left: 4px;
    }

    .suffix-icon {
      margin-left: 8px;
      color: #666;
    }
  `]
})
export class List {
  @Input() items: ListItem[] = [];
  @Output() itemClick = new EventEmitter<ListItem>();
  @Output() itemRightClick = new EventEmitter<ListItem>();
  selectedItem: ListItem | null = null;

  onItemClick(event: MouseEvent, item: ListItem) {
    this.selectedItem = item;

    this.itemClick.emit(item);
  }

  onItemRightClick(event: MouseEvent, item: ListItem) {
    event.preventDefault();

    this.itemRightClick.emit(item);
  }
}
