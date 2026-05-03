import { ApplicationRef, ComponentRef, createComponent, EnvironmentInjector, Type } from '@angular/core';
import { Button, Calendar, Label, Line, Select, Textfield } from './Components';

export class PopupRenderer {
  private componentRefs: Map<string, ComponentRef<any>> = new Map();

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector,
    private frameDocument: Document | null
  ) {}

  renderElements(elements: any[], container: HTMLElement): void {
    if (!this.frameDocument || !container) {
      console.log('[PopupRenderer] Missing frameDocument or container');
      return;
    }

    console.log('[PopupRenderer] Rendering', elements.length, 'elements');

    const sorted = [...elements].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    sorted.forEach((element, index) => {
      console.log('[PopupRenderer] Rendering element:', { type: element.type, name: element.name });
      const elementContainer = this.frameDocument!.createElement('div');
      elementContainer.className = 'popup-element-wrapper';
      elementContainer.id = `popup-element-${index}`;
      container.appendChild(elementContainer);

      this.renderElement(element, elementContainer);
    });
  }

  private renderElement(element: any, container: HTMLElement): void {
    try {
      switch (element.type) {
        case 'label':
          this.renderLabel(element, container);
          break;
        case 'input':
          this.renderInput(element, container);
          break;
        case 'email':
          this.renderEmail(element, container);
          break;
        case 'select':
          this.renderSelect(element, container);
          break;
        case 'calendar':
          this.renderCalendar(element, container);
          break;
        case 'line':
          this.renderLine(element, container);
          break;
        case 'split':
          this.renderSplit(element, container);
          break;
        default:
          console.log('[PopupRenderer] Unknown element type:', element.type);
      }
    } catch (error) {
      console.error('[PopupRenderer] Error rendering element:', element.type, error);
    }
  }

  private renderLabel(element: any, container: HTMLElement): void {
    const wrapper = this.frameDocument!.createElement('div');
    wrapper.className = 'popup-label-wrapper';
    container.appendChild(wrapper);

    const ref = createComponent(Label, {
      environmentInjector: this.injector,
      hostElement: wrapper
    });

    ref.instance.text = element.label ?? '';
    ref.changeDetectorRef.detectChanges();
    this.appRef.attachView(ref.hostView);
    this.componentRefs.set(`label-${element.name}`, ref);
  }

  private renderInput(element: any, container: HTMLElement): void {
    this.renderTextfieldWithLabel(element, container, false);
  }

  private renderEmail(element: any, container: HTMLElement): void {
    this.renderTextfieldWithLabel(element, container, false, 'email');
  }

  private renderTextfieldWithLabel(element: any, container: HTMLElement, isPassword: boolean = false, type?: string): void {
    if (element.label) {
      const labelEl = this.frameDocument!.createElement('label');
      labelEl.textContent = element.label;
      labelEl.className = 'popup-input-label';
      container.appendChild(labelEl);
    }

    const wrapper = this.frameDocument!.createElement('div');
    wrapper.className = 'popup-input-wrapper';
    wrapper.id = element.name;
    container.appendChild(wrapper);

    const ref = createComponent(Textfield, {
      environmentInjector: this.injector,
      hostElement: wrapper
    });

    const instance = ref.instance;
    instance.placeholder = element.placeholder ?? '';
    instance.password = isPassword;

    if (element.minLength) {
      wrapper.setAttribute('data-minlength', element.minLength);
    }
    if (element.maxLength) {
      wrapper.setAttribute('data-maxlength', element.maxLength);
    }
    if (element.required) {
      wrapper.setAttribute('required', 'true');
    }

    ref.changeDetectorRef.detectChanges();
    this.appRef.attachView(ref.hostView);
    this.componentRefs.set(`input-${element.name}`, ref);
  }

  private renderSelect(element: any, container: HTMLElement): void {
    if (element.label) {
      const labelEl = this.frameDocument!.createElement('label');
      labelEl.textContent = element.label;
      labelEl.className = 'popup-select-label';
      container.appendChild(labelEl);
    }

    const wrapper = this.frameDocument!.createElement('div');
    wrapper.className = 'popup-select-wrapper';
    wrapper.id = element.name;
    container.appendChild(wrapper);

    const ref = createComponent(Select, {
      environmentInjector: this.injector,
      hostElement: wrapper
    });

    const instance = ref.instance;
    instance.options = element.options?.map((opt: string) => ({ label: opt, value: opt })) ?? [];
    instance.placeholder = element.placeholder ?? 'Bitte wählen...';
    instance.labelKey = 'label';
    instance.valueKey = 'value';

    if (element.required) {
      wrapper.setAttribute('required', 'true');
    }

    ref.changeDetectorRef.detectChanges();
    this.appRef.attachView(ref.hostView);
    this.componentRefs.set(`select-${element.name}`, ref);
  }

  private renderCalendar(element: any, container: HTMLElement): void {
    if (element.label) {
      const labelEl = this.frameDocument!.createElement('label');
      labelEl.textContent = element.label;
      labelEl.className = 'popup-calendar-label';
      container.appendChild(labelEl);
    }

    const wrapper = this.frameDocument!.createElement('div');
    wrapper.className = 'popup-calendar-wrapper';
    wrapper.id = element.name;
    container.appendChild(wrapper);

    const ref = createComponent(Calendar, {
      environmentInjector: this.injector,
      hostElement: wrapper
    });

    const instance = ref.instance;
    instance.format = element.format ?? 'yyyy-MM-dd';
    instance.minDate = element.minDate;
    instance.maxDate = element.maxDate;

    if (element.required) {
      wrapper.setAttribute('required', 'true');
    }

    ref.changeDetectorRef.detectChanges();
    this.appRef.attachView(ref.hostView);
    this.componentRefs.set(`calendar-${element.name}`, ref);
  }

  private renderLine(element: any, container: HTMLElement): void {
    const wrapper = this.frameDocument!.createElement('div');
    wrapper.className = 'popup-line-wrapper';
    container.appendChild(wrapper);

    const ref = createComponent(Line, {
      environmentInjector: this.injector,
      hostElement: wrapper
    });

    const instance = ref.instance;
    instance.style = element.style ?? 'solid';
    instance.thickness = element.thickness ?? 1;
    instance.color = element.color ?? '#ccc';
    instance.margin = element.margin ?? 10;

    ref.changeDetectorRef.detectChanges();
    this.appRef.attachView(ref.hostView);
    this.componentRefs.set(`line-${element.name}`, ref);
  }

  private renderSplit(element: any, container: HTMLElement): void {
    const direction = element.direction ?? 'horizontal';
    const ratios = element.ratios ?? Array(element.splits).fill(100 / element.splits);
    const gap = element.gap ?? 10;

    const gridTemplate = direction === 'horizontal'
      ? `grid-template-columns: ${ratios.map((r: number) => `${r}fr`).join(' ')}`
      : `grid-template-rows: ${ratios.map((r: number) => `${r}fr`).join(' ')}`;

    const splitContainer = this.frameDocument!.createElement('div');
    splitContainer.className = 'popup-split-container';
    splitContainer.style.cssText = `
      display: grid;
      ${gridTemplate};
      gap: ${gap}px;
      width: 100%;
    `;
    container.appendChild(splitContainer);

    const children = element.children ?? [];
    children.forEach((childGroup: any[]) => {
      const splitItem = this.frameDocument!.createElement('div');
      splitItem.className = 'popup-split-item';
      splitItem.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 10px;
      `;
      splitContainer.appendChild(splitItem);

      childGroup.forEach((child: any) => {
        this.renderElement(child, splitItem);
      });
    });
  }

  getValues(): Map<string, any> {
    const values = new Map();

    this.componentRefs.forEach((ref, key) => {
      if (key.startsWith('input-') || key.startsWith('email-')) {
        const name = key.replace(/^(input|email)-/, '');
        values.set(name, ref.instance.getValue());
      } else if (key.startsWith('select-')) {
        const name = key.replace(/^select-/, '');
        values.set(name, ref.instance.value);
      } else if (key.startsWith('calendar-')) {
        const name = key.replace(/^calendar-/, '');
        values.set(name, ref.instance.getValue());
      }
    });

    return values;
  }

  cleanup(): void {
    this.componentRefs.forEach(ref => {
      this.appRef.detachView(ref.hostView);
      ref.destroy();
    });
    this.componentRefs.clear();
  }
}
