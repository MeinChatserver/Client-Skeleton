import { ApplicationRef, ComponentRef, createComponent, EnvironmentInjector, Type } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Button, Calendar, Label, Line, Select, Textfield, CheckBox } from './Components';

export class PopupRenderer {
  private componentRefs: Map<string, ComponentRef<any>> = new Map();

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector,
    private frameDocument: Document | null,
    private sanitizer: DomSanitizer
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
        case 'content':
          this.renderContent(element, container);
          break;
        case 'textarea':
          this.renderTextarea(element, container);
          break;
        case 'checkbox':
          this.renderCheckbox(element, container);
          break;
        case 'radio':
          this.renderRadio(element, container);
          break;
        case 'slider':
          this.renderSlider(element, container);
          break;
        case 'tabs':
          this.renderTabs(element, container);
          break;
        case 'grid':
          this.renderGrid(element, container);
          break;
        case 'link':
          this.renderLink(element, container);
          break;
        case 'clock':
          this.renderClock(element, container);
          break;
        case 'button':
          this.renderButton(element, container);
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

  private renderContent(element: any, container: HTMLElement): void {
    const wrapper = this.frameDocument!.createElement('div');
    wrapper.className = 'popup-content-wrapper';

    wrapper.innerHTML = element.content ?? '';

    container.appendChild(wrapper);
  }

  private renderTextarea(element: any, container: HTMLElement): void {
    if (element.label) {
      const labelEl = this.frameDocument!.createElement('label');
      labelEl.textContent = element.label;
      labelEl.className = 'popup-textarea-label';
      container.appendChild(labelEl);
    }

    const wrapper = this.frameDocument!.createElement('div');
    wrapper.className = 'popup-textarea-wrapper';
    wrapper.id = element.name;
    container.appendChild(wrapper);

    const textarea = this.frameDocument!.createElement('textarea');
    textarea.name = element.name;
    textarea.placeholder = element.placeholder ?? '';
    textarea.rows = element.rows ?? 4;
    textarea.cols = element.cols ?? 50;
    textarea.value = element.value ?? '';

    if (element.minLength) {
      textarea.setAttribute('minlength', element.minLength);
    }
    if (element.maxLength) {
      textarea.setAttribute('maxlength', element.maxLength);
    }
    if (element.required) {
      textarea.setAttribute('required', 'true');
    }
    if (element.readonly) {
      textarea.setAttribute('readonly', 'true');
    }

    wrapper.appendChild(textarea);
    (this.componentRefs as any).set(`textarea-${element.name}`, { instance: { getValue: () => textarea.value } });
  }

  private renderCheckbox(element: any, container: HTMLElement): void {
    const wrapper = this.frameDocument!.createElement('div');
    wrapper.className = 'popup-checkbox-group';
    container.appendChild(wrapper);

    if (element.label && !element.options) {
      const groupLabel = this.frameDocument!.createElement('label');
      groupLabel.className = 'popup-checkbox-group-label';
      groupLabel.textContent = element.label;
      wrapper.appendChild(groupLabel);
    }

    const options = element.options ?? (element.label ? [] : []);

    if (options.length > 0) {
      if (element.label) {
        const groupLabel = this.frameDocument!.createElement('label');
        groupLabel.className = 'popup-checkbox-group-label';
        groupLabel.textContent = element.label;
        wrapper.appendChild(groupLabel);
      }

      const checkboxContainer = this.frameDocument!.createElement('div');
      checkboxContainer.className = 'popup-checkbox-options';

      options.forEach((option: any, index: number) => {
        const checkboxWrapper = this.frameDocument!.createElement('div');
        checkboxWrapper.className = 'popup-checkbox-item';

        const checkboxEl = this.frameDocument!.createElement('input');
        checkboxEl.type = 'checkbox';
        checkboxEl.id = `${element.name}-${index}`;
        checkboxEl.name = element.name;
        checkboxEl.value = option.value ?? option;
        checkboxEl.checked = option.checked ?? false;

        const labelEl = this.frameDocument!.createElement('label');
        labelEl.htmlFor = `${element.name}-${index}`;
        labelEl.textContent = option.label ?? option;

        checkboxWrapper.appendChild(checkboxEl);
        checkboxWrapper.appendChild(labelEl);
        checkboxContainer.appendChild(checkboxWrapper);
      });

      wrapper.appendChild(checkboxContainer);

      (this.componentRefs as any).set(`checkbox-${element.name}`, {
        instance: { getValue: () => {
          const checked = Array.from(this.frameDocument!.querySelectorAll(`input[name="${element.name}"]:checked`)) as HTMLInputElement[];
          return checked.map(el => el.value);
        }}
      });
    } else {
      const checkboxEl = this.frameDocument!.createElement('input');
      checkboxEl.type = 'checkbox';
      checkboxEl.id = element.name;
      checkboxEl.name = element.name;
      checkboxEl.checked = element.checked ?? false;
      if (element.required) {
        checkboxEl.setAttribute('required', 'true');
      }

      const labelEl = this.frameDocument!.createElement('label');
      labelEl.htmlFor = element.name;
      labelEl.className = 'popup-checkbox-label';
      labelEl.textContent = element.label ?? '';

      wrapper.appendChild(checkboxEl);
      wrapper.appendChild(labelEl);

      (this.componentRefs as any).set(`checkbox-${element.name}`, { instance: { getValue: () => checkboxEl.checked } });
    }
  }

  private renderRadio(element: any, container: HTMLElement): void {
    const wrapper = this.frameDocument!.createElement('div');
    wrapper.className = 'popup-radio-group';
    container.appendChild(wrapper);

    if (element.label) {
      const groupLabel = this.frameDocument!.createElement('label');
      groupLabel.className = 'popup-radio-group-label';
      groupLabel.textContent = element.label;
      wrapper.appendChild(groupLabel);
    }

    const options = element.options ?? [];
    const radioContainer = this.frameDocument!.createElement('div');
    radioContainer.className = 'popup-radio-options';

    options.forEach((option: any, index: number) => {
      const radioWrapper = this.frameDocument!.createElement('div');
      radioWrapper.className = 'popup-radio-item';

      const radioEl = this.frameDocument!.createElement('input');
      radioEl.type = 'radio';
      radioEl.id = `${element.name}-${index}`;
      radioEl.name = element.name;
      radioEl.value = option.value ?? option;
      radioEl.checked = option.checked ?? element.value === option.value;

      const labelEl = this.frameDocument!.createElement('label');
      labelEl.htmlFor = `${element.name}-${index}`;
      labelEl.textContent = option.label ?? option;

      radioWrapper.appendChild(radioEl);
      radioWrapper.appendChild(labelEl);
      radioContainer.appendChild(radioWrapper);
    });

    wrapper.appendChild(radioContainer);
    (this.componentRefs as any).set(`radio-${element.name}`, {
      instance: { getValue: () => {
        const selected = this.frameDocument!.querySelector(`input[name="${element.name}"]:checked`) as HTMLInputElement;
        return selected?.value ?? null;
      }}
    });
  }

  private renderSlider(element: any, container: HTMLElement): void {
    if (element.label) {
      const labelEl = this.frameDocument!.createElement('label');
      labelEl.textContent = element.label;
      labelEl.className = 'popup-slider-label';
      container.appendChild(labelEl);
    }

    const wrapper = this.frameDocument!.createElement('div');
    wrapper.className = 'popup-slider-wrapper';
    container.appendChild(wrapper);

    const slider = this.frameDocument!.createElement('input');
    slider.type = 'range';
    slider.id = element.name;
    slider.name = element.name;
    slider.min = element.min ?? '0';
    slider.max = element.max ?? '100';
    slider.step = element.step ?? '1';
    slider.value = element.value ?? element.min ?? '0';
    slider.className = 'popup-slider-input';

    const valueDisplay = this.frameDocument!.createElement('span');
    valueDisplay.className = 'popup-slider-value';
    valueDisplay.textContent = slider.value;

    slider.addEventListener('input', () => {
      valueDisplay.textContent = slider.value;
    });

    wrapper.appendChild(slider);
    if (element.showValue !== false) {
      wrapper.appendChild(valueDisplay);
    }

    (this.componentRefs as any).set(`slider-${element.name}`, { instance: { getValue: () => slider.value } });
  }

  private renderTabs(element: any, container: HTMLElement): void {
    const tabsWrapper = this.frameDocument!.createElement('div');
    tabsWrapper.className = 'popup-tabs-wrapper';
    container.appendChild(tabsWrapper);

    const tabsList = this.frameDocument!.createElement('div');
    tabsList.className = 'popup-tabs-list';
    tabsWrapper.appendChild(tabsList);

    const tabsContent = this.frameDocument!.createElement('div');
    tabsContent.className = 'popup-tabs-content';
    tabsWrapper.appendChild(tabsContent);

    const tabs = element.tabs ?? [];
    const children = element.children ?? [];

    tabs.forEach((tab: any, index: number) => {
      const tabLabel = typeof tab === 'string' ? tab : (tab.label ?? `Tab ${index + 1}`);
      const tabButton = this.frameDocument!.createElement('button');
      tabButton.className = `popup-tab-button ${index === 0 ? 'active' : ''}`;
      tabButton.textContent = tabLabel;
      tabButton.type = 'button';

      const tabPanel = this.frameDocument!.createElement('div');
      tabPanel.className = `popup-tab-panel ${index === 0 ? 'active' : ''}`;
      tabPanel.id = `tab-${element.name}-${index}`;

      if (typeof tab === 'object' && tab.content) {
        tabPanel.innerHTML = tab.content;
      }

      if (typeof tab === 'object' && tab.elements && Array.isArray(tab.elements)) {
        this.renderElements(tab.elements, tabPanel);
      }

      if (children[index] && Array.isArray(children[index])) {
        this.renderElements(children[index], tabPanel);
      }

      tabButton.addEventListener('click', () => {
        Array.from(tabsWrapper.querySelectorAll('.popup-tab-button')).forEach(btn => btn.classList.remove('active'));
        Array.from(tabsWrapper.querySelectorAll('.popup-tab-panel')).forEach(panel => panel.classList.remove('active'));
        tabButton.classList.add('active');
        tabPanel.classList.add('active');
      });

      tabsList.appendChild(tabButton);
      tabsContent.appendChild(tabPanel);
    });

    (this.componentRefs as any).set(`tabs-${element.name}`, {
      instance: { getValue: () => {
        const active = tabsContent.querySelector('.popup-tab-panel.active');
        return active?.id ?? null;
      }}
    });
  }

  private renderGrid(element: any, container: HTMLElement): void {
    const gridWrapper = this.frameDocument!.createElement('div');
    gridWrapper.className = 'popup-grid-wrapper';

    const columns = element.columns ?? 2;
    const gap = element.gap ?? 10;

    gridWrapper.style.cssText = `
      display: grid;
      grid-template-columns: repeat(${columns}, 1fr);
      gap: ${gap}px;
      width: 100%;
    `;

    container.appendChild(gridWrapper);

    const children = element.children ?? [];
    children.forEach((child: any) => {
      const gridItem = this.frameDocument!.createElement('div');
      gridItem.className = 'popup-grid-item';
      gridWrapper.appendChild(gridItem);

      if (Array.isArray(child)) {
        this.renderElements(child, gridItem);
      } else {
        this.renderElement(child, gridItem);
      }
    });
  }

  private renderLink(element: any, container: HTMLElement): void {
    const wrapper = this.frameDocument!.createElement('div');
    wrapper.className = 'popup-link-wrapper';
    container.appendChild(wrapper);

    const link = this.frameDocument!.createElement('a');
    link.href = element.url ?? '#';
    link.textContent = element.label ?? 'Link';
    link.className = 'popup-link';

    if (element.target) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }

    wrapper.appendChild(link);
  }

  private renderClock(element: any, container: HTMLElement): void {
    if (element.label) {
      const labelEl = this.frameDocument!.createElement('label');
      labelEl.textContent = element.label;
      labelEl.className = 'popup-clock-label';
      container.appendChild(labelEl);
    }

    const wrapper = this.frameDocument!.createElement('div');
    wrapper.className = 'popup-clock-wrapper';
    wrapper.id = element.name;
    container.appendChild(wrapper);

    const input = this.frameDocument!.createElement('input');
    input.type = 'time';
    input.name = element.name;
    input.value = element.value ?? '';

    if (element.required) {
      input.setAttribute('required', 'true');
    }

    wrapper.appendChild(input);

    (this.componentRefs as any).set(`clock-${element.name}`, { instance: { getValue: () => input.value } });
  }

  private renderButton(element: any, container: HTMLElement): void {
    const wrapper = this.frameDocument!.createElement('div');
    wrapper.className = 'popup-button-wrapper';
    container.appendChild(wrapper);

    const ref = createComponent(Button, {
      environmentInjector: this.injector,
      hostElement: wrapper
    });

    const instance = ref.instance;
    instance.text = element.label ?? 'Button';

    if (element.style === 'primary') {
      wrapper.style.cssText = 'padding: 10px 0;';
    }

    ref.changeDetectorRef.detectChanges();
    this.appRef.attachView(ref.hostView);
    this.componentRefs.set(`button-${element.name}`, ref);
  }

  getValues(): Map<string, any> {
    const values = new Map();

    this.componentRefs.forEach((ref, key) => {
      if (key.startsWith('input-') || key.startsWith('email-') || key.startsWith('clock-')) {
        const name = key.replace(/^(input|email|clock)-/, '');
        values.set(name, ref.instance.getValue());
      } else if (key.startsWith('select-')) {
        const name = key.replace(/^select-/, '');
        values.set(name, ref.instance.value);
      } else if (key.startsWith('calendar-')) {
        const name = key.replace(/^calendar-/, '');
        values.set(name, ref.instance.getValue());
      } else if (key.startsWith('textarea-') || key.startsWith('checkbox-') || key.startsWith('radio-') || key.startsWith('slider-') || key.startsWith('tabs-')) {
        const name = key.replace(/^[a-z]+-/, '');
        values.set(name, ref.instance.getValue());
      }
    });

    return values;
  }

  cleanup(): void {
    this.componentRefs.forEach(ref => {
      if (ref && ref.hostView) {
        this.appRef.detachView(ref.hostView);
        ref.destroy();
      }
    });
    this.componentRefs.clear();
  }
}
