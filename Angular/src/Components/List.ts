import {Component, EventEmitter, Input, Output} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ListItem} from '../Models';

@Component({
  selector: 'ui-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    @for (item of items; track item.label) {
      <div
        class="list-item"
        [class.active]="isItemSelected(item)"
        (click)="onItemClick($event, item)"
        (contextmenu)="onItemRightClick($event, item)">

        @if (item.prefixIcon) {
            <i [class]="item.prefixIcon" class="prefix-icon"></i>
        }

        <span class="label" [style.color]="getRankColor(item.rank)">{{ item.label }}</span>
        @if(item.count) {
          <small class="count">({{ item.count }})</small>
        }

        @if (item.suffixIcon) {
            <i [class]="item.suffixIcon" class="suffix-icon"></i>
        }
      </div>
    }
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
      background: var(--ui-list-background, #FFFFFF);
      color: var(--ui-list-color, inherit);
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
      background: var(--ui-list-hover-background, rgba(255, 255, 255, 0.3));
    }

    .list-item.active {
      background: var(--ui-list-active-background, rgba(0, 0, 128, 0.8));
      color: var(--ui-list-active-color, #FFFFFF);
    }

    .list-item.active:not(.multiselect) {
      cursor: text;
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
  @Input() multiselect: boolean = false;
  @Output() itemClick = new EventEmitter<ListItem>();
  @Output() itemRightClick = new EventEmitter<ListItem>();
  @Output() selectionChange = new EventEmitter<ListItem[]>();
  selectedItem: ListItem | null = null;
  selectedItems: ListItem[] = [];

  isItemSelected(item: ListItem): boolean {
    if (this.multiselect) {
      return this.selectedItems.some(selected => this.isSameItem(selected, item));
    }
    return this.selectedItem ? this.isSameItem(this.selectedItem, item) : false;
  }

  private isSameItem(a: ListItem, b: ListItem): boolean {
    return (a.id && b.id && a.id === b.id) || a.label === b.label;
  }

  onItemClick(event: MouseEvent, item: ListItem) {
    if (this.multiselect && event.ctrlKey) {
      const isSelected = this.selectedItems.some(selected => this.isSameItem(selected, item));
      if (isSelected) {
        this.selectedItems = this.selectedItems.filter(selected => !this.isSameItem(selected, item));
      } else {
        this.selectedItems = [...this.selectedItems, item];
      }
      this.selectionChange.emit([...this.selectedItems]);
    } else if (!this.multiselect) {
      this.selectedItem = item;
    }

    this.itemClick.emit(item);
  }

  onItemRightClick(event: MouseEvent, item: ListItem) {
    event.preventDefault();

    this.itemRightClick.emit(item);
  }

  getRankColor(rank?: number): string {
    if (!rank) return 'inherit';
    return `var(--room-rank-${rank}, inherit)`;
  }
}
