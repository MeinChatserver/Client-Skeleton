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

export default class List {
    constructor(element, data, options = {}) {
        this.element     = element;
        this.options    = {
            ...options,
            value:  options.value || 'id',
            label:  options.label || 'name'
        };

        this.data = new Proxy(data, {
            set: (target, property, value) => {
                target[property] = value;
                this.render();
                return true;
            },
            deleteProperty: (target, property) => {
                delete target[property];
                this.render();
                return true;
            }
        });

        this.render();

        this.element.addEventListener('change', (event) => {
            if (this.options.onChange) {
                const value                  = event.target.value;
                const typedValue = isNaN(value) ? value : Number(value);

                this.options.onChange(this.data.find(item => item[this.options.value] === typedValue), typedValue);
            }
        });
    }

    render() {
        const currentValue      = this.element.value;
        this.element.innerHTML  = '';

        if(this.options.placeholder) {
            const placeholderOption    = document.createElement('option');
            placeholderOption.value                     = '';
            placeholderOption.textContent               = this.options.placeholder;
            placeholderOption.disabled                  = true;
            placeholderOption.selected                  = !currentValue;
            this.element.appendChild(placeholderOption);
        }

        this.data.forEach(item => {
            const option   = document.createElement('option');
            option.value                    = item[this.options.value];
            option.textContent              = item[this.options.label];

            if(item[this.options.value] === currentValue) {
                option.selected = true;
            }

            this.element.appendChild(option);
        });
    }

    appendTo(parent) {
        parent.appendChild(this.element);
    }

    add(item) {
        this.data.push(item);
    }

    remove(index) {
        this.data.splice(index, 1);
    }

    update(index, item) {
        this.data[index] = item;
    }

    clear() {
        this.data.length = 0;
    }

    setData(data) {
        this.data.length = 0;
        this.data.push(...data);
    }

    getSelectedItem() {
        return this.data.find(item => (item[this.options.value] === this.element.value));
    }
}