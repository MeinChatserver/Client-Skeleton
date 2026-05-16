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

        @if (item.prefixIcons?.length) {
          <span class="icons icons-prefix">
            @for (icon of item.prefixIcons; track $index) {
              <img class="user-icon" [src]="icon.url" alt="" />
            }
          </span>
        }

        <span class="label" [style.color]="getRankColor(item.rank)">{{ item.label }}</span>

        @if(item.number != null) {
          <small class="count">({{ item.number }})</small>
        }

        @if (item.suffixIcons?.length) {
          <span class="icons icons-suffix">
            @for (icon of item.suffixIcons; track $index) {
              <img class="user-icon" [src]="icon.url" alt="" />
            }
          </span>
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

    .label {
      font-size: 14px;
    }

    .count {
      color: #999999;
      font-size: 12px;
      margin-left: 4px;
    }

    .icons {
      display: inline-flex;
      gap: 2px;
      vertical-align: middle;
    }

    .icons-prefix {
      margin-right: 4px;
    }

    .icons-suffix {
      margin-left: 4px;
    }

    .icons .user-icon {
      pointer-events: none;
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
      return;
    }

    if (!this.multiselect) {
      this.selectedItem = item;
    }

    this.itemClick.emit(item);
  }

  onItemRightClick(event: MouseEvent, item: ListItem) {
    event.preventDefault();

    this.itemRightClick.emit(item);
  }

  getRankColor(rank?: number): string {
    if(rank == null) {
      return 'inherit';
    }

    return `var(--rank_${rank})`;
  }
}
