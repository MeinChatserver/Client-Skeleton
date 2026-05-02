'use strict';
/**
 * Mein Chatserver
 * ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
 * Licensed Materials - Property of mein-chatserver.de.
 * © Copyright 2024. All Rights Reserved.
 *
 * @version 1.0.0
 * @author  Adrian Preuß
 */

export default (new class I18N {
    Language            = 'en_US';
    Translations    	= {};
    Cache 				= new Map();

    async load(code, update) {
        try {
            const response = await fetch(import.meta.resolve('../Languages/' + code + '.json'));
            this.Translations[code]  = await response.json();

            if(update) {
                this.setLanguage(code);
            }
        } catch(error) {
            console.error('Fehler beim Laden:', error);
        }
    }

    setLanguage(lang) {
        this.Language = lang;

        this.Cache.forEach((cache) => {
            cache.proxyObj._updateValue();
        });
    }

    getLanguage() {
        return this.Language;
    }

    _(key) {
        if (this.Cache.has(key)) {
            return this.Cache.get(key).proxy;
        }

        const self = this;
        const proxyObj = {
            _element:   null,
            _property:  null,
            _key:       key,

            _updateValue() {
                const value = self.Translations[self.Language]?.[this._key] || this._key;

                if(this._element) {
                    this._element[this._property] = value;
                }

                return value;
            },

            toString() {
                return self.Translations[self.Language]?.[key] || key;
            },

            valueOf() {
                return this.toString();
            }
        };

        const proxy = new Proxy(proxyObj, {
            get(target, prop) {
                if(prop === 'binding') {
                    return (element, property = 'innerText') => {
                        target._element     = element;
                        target._property    = property;
                        target._updateValue();
                        return proxy;
                    };
                }

                return target[prop];
            }
        });

        this.Cache.set(key, { proxyObj, proxy });
		
        return proxy;
    }
}());