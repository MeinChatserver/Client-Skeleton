'use strict';
/**
 * Mein Chatserver
 * ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
 * Licensed Materials - Property of mein-chatserver.de.
 * © Copyright 2024. All Rights Reserved.
 *
 * @version 1.0.1
 * @author  Adrian Preuß
 */

export default class Components {
    static render(elements, container) {
        if (!elements || !Array.isArray(elements)) {
            console.error('Invalid elements array');
            return;
        }

        if (!container) {
            console.error('Invalid container element');
            return;
        }

        const sorted = [...elements].sort((a, b) => (a.order || 0) - (b.order || 0));

        for (const element of sorted) {
            const dom = this.createElement(element);
            if (dom) {
                container.appendChild(dom);
            }
        }
    }

    static createElement(element) {
        if (!element || !element.type) {
            console.warn('Invalid element:', element);
            return null;
        }

        switch (element.type) {
            case 'label':
                return this.createLabel(element);

            case 'content':
                return this.createContent(element);

            case 'input':
                return this.createInput(element);

            case 'textarea':
                return this.createTextarea(element);

            case 'email':
            case 'mail':
                return this.createEmail(element);

            case 'select':
                return this.createSelect(element);

            case 'radio':
                return this.createRadio(element);

            case 'checkbox':
                return this.createCheckbox(element);

            case 'calendar':
                return this.createCalendar(element);

            case 'clock':
                return this.createClock(element);

            case 'slider':
                return this.createSlider(element);

            case 'button':
                return this.createButton(element);

            case 'link':
                return this.createLink(element);

            case 'line':
                return this.createLine(element);

            case 'grid':
                return this.createGrid(element);

            case 'split':
                return this.createSplit(element);

            case 'tabs':
                return this.createTabs(element);

            default:
                console.warn('Unknown element type:', element.type);
                return null;
        }
    }

    // ==================== CONTENT ELEMENTS ====================

    static createLabel(element) {
        const label = document.createElement('label');
        label.textContent = element.label || '';
        return label;
    }

    static createContent(element) {
        const div = document.createElement('div');
        div.innerHTML = element.content || '';
        return div;
    }

    static createLink(element) {
        const link = document.createElement('a');
        link.href = element.url || '#';
        link.textContent = element.label || element.url || 'Link';
        if (element.target) {
            link.target = '_blank';
        }
        return link;
    }

    // ==================== FORM ELEMENTS ====================

    static createInput(element) {
        const wrapper = document.createElement('div');

        if (element.label) {
            const label = document.createElement('label');
            label.textContent = element.label;
            wrapper.appendChild(label);
        }

        const input = document.createElement('input');
        input.type = 'text';
        input.name = element.name || '';
        input.placeholder = element.placeholder || '';
        if (element.required) input.required = true;
        if (element.minLength) input.minLength = element.minLength;
        if (element.maxLength) input.maxLength = element.maxLength;
        wrapper.appendChild(input);

        return wrapper;
    }

    static createTextarea(element) {
        const wrapper = document.createElement('div');

        if (element.label) {
            const label = document.createElement('label');
            label.textContent = element.label;
            wrapper.appendChild(label);
        }

        const textarea = document.createElement('textarea');
        textarea.name = element.name || '';
        textarea.placeholder = element.placeholder || '';
        if (element.required) textarea.required = true;
        textarea.rows = element.rows || 3;
        if (element.maxLength) textarea.maxLength = element.maxLength;
        wrapper.appendChild(textarea);

        return wrapper;
    }

    static createEmail(element) {
        const wrapper = document.createElement('div');

        if (element.label) {
            const label = document.createElement('label');
            label.textContent = element.label;
            wrapper.appendChild(label);
        }

        const input = document.createElement('input');
        input.type = 'email';
        input.name = element.name || '';
        input.placeholder = element.placeholder || '';
        if (element.required) input.required = true;
        wrapper.appendChild(input);

        return wrapper;
    }

    static createSelect(element) {
        const wrapper = document.createElement('div');

        if (element.label) {
            const label = document.createElement('label');
            label.textContent = element.label;
            wrapper.appendChild(label);
        }

        const select = document.createElement('select');
        select.name = element.name || '';
        if (element.required) select.required = true;

        if (element.placeholder) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = element.placeholder;
            select.appendChild(option);
        }

        if (element.options && Array.isArray(element.options)) {
            for (const opt of element.options) {
                const option = document.createElement('option');
                option.value = opt;
                option.textContent = opt;
                select.appendChild(option);
            }
        }

        wrapper.appendChild(select);
        return wrapper;
    }

    static createRadio(element) {
        const wrapper = document.createElement('div');

        if (element.label) {
            const label = document.createElement('label');
            label.textContent = element.label;
            wrapper.appendChild(label);
        }

        if (element.options && Array.isArray(element.options)) {
            const radioGroup = document.createElement('div');
            radioGroup.className = 'radio-group';

            for (const opt of element.options) {
                const div = document.createElement('div');

                const input = document.createElement('input');
                input.type = 'radio';
                input.name = element.name || '';
                input.value = opt;
                input.id = `${element.name}_${opt}`;

                const label = document.createElement('label');
                label.htmlFor = input.id;
                label.textContent = opt;

                div.appendChild(input);
                div.appendChild(label);
                radioGroup.appendChild(div);
            }

            wrapper.appendChild(radioGroup);
        } else {
            const input = document.createElement('input');
            input.type = 'radio';
            wrapper.appendChild(input);

            const label = document.createElement('label');
            label.textContent = 'Text';
            wrapper.appendChild(label);
        }

        return wrapper;
    }

    static createCheckbox(element) {
        const wrapper = document.createElement('div');

        if (element.options && Array.isArray(element.options) && element.options.length > 0) {
            const checkboxGroup = document.createElement('div');
            checkboxGroup.className = 'checkbox-group';

            for (const opt of element.options) {
                const div = document.createElement('div');

                const input = document.createElement('input');
                input.type = 'checkbox';
                input.name = `${element.name}[]`;
                input.value = opt;
                input.id = `${element.name}_${opt}`;

                const label = document.createElement('label');
                label.htmlFor = input.id;
                label.textContent = opt;

                div.appendChild(input);
                div.appendChild(label);
                checkboxGroup.appendChild(div);
            }

            wrapper.appendChild(checkboxGroup);
        } else {
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.name = element.name || '';
            input.id = element.name || '';

            const label = document.createElement('label');
            label.htmlFor = input.id;
            label.textContent = element.label || '';

            wrapper.appendChild(input);
            wrapper.appendChild(label);
        }

        return wrapper;
    }

    static createCalendar(element) {
        const wrapper = document.createElement('div');

        if (element.label) {
            const label = document.createElement('label');
            label.textContent = element.label;
            wrapper.appendChild(label);
        }

        const input = document.createElement('input');
        input.type = 'date';
        input.name = element.name || '';
        if (element.required) input.required = true;
        if (element.minDate) input.min = element.minDate;
        if (element.maxDate) input.max = element.maxDate;
        wrapper.appendChild(input);

        return wrapper;
    }

    static createClock(element) {
        const wrapper = document.createElement('div');

        if (element.label) {
            const label = document.createElement('label');
            label.textContent = element.label;
            wrapper.appendChild(label);
        }

        const input = document.createElement('input');
        input.type = 'time';
        input.name = element.name || '';
        if (element.required) input.required = true;
        wrapper.appendChild(input);

        return wrapper;
    }

    static createSlider(element) {
        const wrapper = document.createElement('div');

        if (element.label) {
            const label = document.createElement('label');
            label.textContent = element.label;
            wrapper.appendChild(label);
        }

        const input = document.createElement('input');
        input.type = 'range';
        input.name = element.name || '';
        input.min = element.min || 0;
        input.max = element.max || 100;
        input.step = element.step || 1;
        wrapper.appendChild(input);

        return wrapper;
    }

    static createButton(element) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-' + (element.style || 'primary');
        button.textContent = element.label || 'Button';
        if (element.action) {
            button.setAttribute('data-action', element.action);
        }
        return button;
    }

    // ==================== LAYOUT ELEMENTS ====================

    static createLine(element) {
        const line = document.createElement('hr');
        line.style.borderStyle = element.style || 'solid';
        line.style.borderWidth = (element.thickness || 1) + 'px';
        line.style.borderColor = element.color || '#cccccc';
        line.style.margin = (element.margin || 20) + 'px 0';
        return line;
    }

    static createGrid(element) {
        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = `repeat(${element.columns || 2}, 1fr)`;
        grid.style.gap = (element.gap || 15) + 'px';

        if (element.children && Array.isArray(element.children)) {
            for (const cell of element.children) {
                const cellDiv = document.createElement('div');
                cellDiv.className = 'grid-cell';

                if (Array.isArray(cell)) {
                    this.render(cell, cellDiv);
                }

                grid.appendChild(cellDiv);
            }
        }

        return grid;
    }

    static createSplit(element) {
        const split = document.createElement('div');
        split.style.display = 'flex';
        split.style.flexDirection = (element.direction === 'vertical') ? 'column' : 'row';
        split.style.gap = (element.gap || 15) + 'px';

        if (element.children && Array.isArray(element.children)) {
            for (let i = 0; i < element.children.length; i++) {
                const splitDiv = document.createElement('div');
                splitDiv.className = 'split-cell';

                const ratio = element.ratios && element.ratios[i] ? element.ratios[i] : (100 / element.children.length);
                splitDiv.style.flex = ratio;

                if (Array.isArray(element.children[i])) {
                    this.render(element.children[i], splitDiv);
                }

                split.appendChild(splitDiv);
            }
        }

        return split;
    }

    static createTabs(element) {
        const wrapper = document.createElement('div');

        const nav = document.createElement('ul');
        nav.className = 'nav nav-' + (element.style || 'pills');

        const content = document.createElement('div');
        content.className = 'tab-content';

        const tabs = element.tabs || ['Tab 1'];

        tabs.forEach((tab, index) => {
            // Tab Button
            const li = document.createElement('li');
            li.className = 'nav-item';

            const link = document.createElement('a');
            link.className = 'nav-link' + (index === (element.activeTab || 0) ? ' active' : '');
            link.href = '#';
            link.textContent = tab;
            link.onclick = (e) => {
                e.preventDefault();
                nav.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                content.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
                link.classList.add('active');
                content.children[index].classList.add('active');
            };

            li.appendChild(link);
            nav.appendChild(li);

            // Tab Pane
            const pane = document.createElement('div');
            pane.className = 'tab-pane' + (index === (element.activeTab || 0) ? ' active' : '');

            if (element.children && element.children[index] && Array.isArray(element.children[index])) {
                this.render(element.children[index], pane);
            }

            content.appendChild(pane);
        });

        wrapper.appendChild(nav);
        wrapper.appendChild(content);
        return wrapper;
    }
}