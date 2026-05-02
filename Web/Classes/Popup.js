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

import WindowManager from './WindowManager.js';

export default class Popup {
    Frame   = null;
    Loading = null;
    Head = null;
    Body = null;
    Canvas = null;
    Name = null;
    Options = {
        popup:		true,
        location:	false,
        toolbar:	false,
        menubar:	false,
        status:		false,
        resizable:	false,
        titlebar:	false,
        scrollbars:	false,
        showLoading: false
    };

    constructor(name, options = {}) {
        this.Name = name;
        this.Options = {
            ...this.Options,
            ...options,
            width: options.width || 400,
            height: options.height || 100
        };

        this.#setup();
    }

    getName() {
        return this.Name;
    }

    async #setup() {
        this.Frame = window.open('', this.Name, Object.entries(this.Options).map(([ key, value ]) => key + '=' + (value ? 'yes' : 'no')).join(','));

        if(!this.Frame) {
            alert('Cant create Popup. Popup-Blocker active?');
            return;
        }

        this.resize(this.Options.width, this.Options.height);

        this.Frame.document.documentElement.dataset.theme = document.documentElement.dataset.theme;
        this.Frame.console			= window.top.console;
        this.Frame.name				= this.Name;
        this.Canvas		            = document.createElement('canvas');
        this.Frame.document.Client	= Client;

        this.Frame.addEventListener('beforeunload', (event) => {
            WindowManager.removeFrame(this);

            Client.send({
                operation:	'WINDOW_CLOSE',
                data:		this.Name
            });
        });

        this.Frame.addEventListener('resize', () => this.onResize());

        const initDOM = () => {
            this.Head = this.Frame.document.head || this.Frame.document.querySelector('head');
            this.Body = this.Frame.document.body || this.Frame.document.querySelector('body');

            if(this.Options.showLoading) {
                this.initLoading();
            }

            this.initViewport();
        };

        if(this.Frame.document.readyState === 'loading') {
            this.Frame.document.addEventListener('DOMContentLoaded', initDOM);
        } else {
            initDOM();
        }
    }

    onResize() {
        if(this.Canvas) {
            const ratio = window.devicePixelRatio || 1;
            const rect = this.Canvas.getBoundingClientRect();

            if(rect.width > 0 && rect.height > 0) {
                this.Canvas.width = rect.width * ratio;
                this.Canvas.height = rect.height * ratio;

                const ctx = this.Canvas.getContext('2d');

                if(ctx) {
                    ctx.scale(ratio, ratio);
                }
            }
        }
    }

    change(name) {
        this.Name = name;
        this.Frame.name	= name;

        Client.send({
            operation:	'WINDOW_INIT',
            data:		name
        });
    }

    getContext() {
        if(!this.Canvas) {
            return null;
        }

        return this.Canvas.getContext('2d');
    }

    paint() {
        if(!this.Canvas) {
            return;
        }

        const context = this.getContext();

        if(context) {
            context.clearRect(0, 0, this.Canvas.width, this.Canvas.height);
        }

        this.Frame.requestAnimationFrame(this.paint.bind(this));
    }

    initContent() {
        this.Body.ondragstart = this.void;
        this.Body.ondrop = this.void;

        this.Body.addEventListener('contextmenu', this.void, true);
        this.Body.addEventListener('click', (event) => {
            let data = event.target.closest('[data-action]');

            if(data) {
                let action  = data.dataset.action;
                let value   = null;

                if(action.indexOf(':') !== -1) {
                    [action, value] = action.split(':', 2);
                }

                switch(action) {
                    case 'profile':
                        Client.send({
                            operation:	'PROFILE_OPEN',
                            data:		value
                        });
                        break;
                }
            }
        });
    }

    void(event) {
        event.preventDefault();
        return false;
    }

    initLoading() {
        if(!this.Body || !this.Head) {
            console.error('Cannot init loading - Body or Head not available');
            return false;
        }

        /* Loading Animation */
        let css_loading = '@keyframes rotate { to { transform: rotate(360deg); } } ';
        css_loading += 'ui-loading { display: block; position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 10000; background: rgba(255, 255, 255, 0.9); } ';
        css_loading += 'ui-loading.hidden { display: none; } ';
        css_loading += 'ui-loading.error { display: none; } '; /* @ToDo? Error Message? */
        css_loading += 'ui-loading::after { display: inline-block; content: ""; left: 50%; top: 50%; position: absolute; width: 50px; height: 50px; border-radius: 50%; border: 4px solid #0D6EFD; border-right-color: transparent; animation: 0.75s linear infinite rotate; } ';

        this.Loading = document.createElement('ui-loading');
        let style_loading = document.createElement('style');

        this.Body.appendChild(this.Loading);
        this.Head.appendChild(style_loading);

        if(style_loading.styleSheet) {
            style_loading.styleSheet.cssText = css_loading;
        } else {
            style_loading.appendChild(document.createTextNode(css_loading));
        }

        return true;
    }

    getReadyState() {
        return this.Frame.document.readyState;
    }

    getDocument() {
        return this.Frame.document;
    }

    initViewport() {
        if(!this.Head) {
            console.error('Cannot init viewport - Head not available');
            return;
        }

        /* Set the Viewport */
        let viewport = document.createElement('meta');
        viewport.setAttribute('name', 'viewport');
        viewport.setAttribute('content', 'width=device-width, initial-scale=1, minimum-scale=1, shrink-to-fit=no');
        this.Head.appendChild(viewport);
    }

    loadStylesheets(files) {
        if(!files || files.length === 0) {
            return Promise.resolve();
        }

        return Promise.all(files.map(file => WindowManager.load(this.Frame.document, file))).then(() => {
            if(this.Loading && this.Loading.classList) {
                setTimeout(() => {
                    this.Loading.classList.add('hidden');
                }, 500);
            }
        }).catch((error) => {
            if(this.Loading && this.Loading.classList) {
                this.Loading.classList.add('error');
            }

            window.top.console.error(error);
        });
    }

    init() {
        this.initContent();
        this.loadStylesheets([
            '../UI/Style.css',
            '../UI/Components.css',
            '../UI/Popup.css',
            '../UI/Background.css',
            '../UI/Themes/Modern.css'
        ]);

        this.onResize();

        Client.send({
            operation:	'POPUP_INIT',
            data:		this.Name
        });

        this.paint();
    }

    setTitle(title) {
        this.Frame.document.close();
        const head = this.Frame.document.head || this.Frame.document.querySelector('head');
        this.Frame.title = title;
        this.Frame.document.title = title;

        const titleElement = head.querySelector('title');
        if(titleElement) {
            titleElement.textContent = title;
        }
    }

    focus() {
        if(this.Frame) {
            this.Frame.focus();
        }
    }

    close() {
        if(this.Frame) {
            this.Frame.close();
        }
    }

    resize(width, height) {
        if(this.Frame) {
            this.Frame.resizeTo(width, height);
        }
    }
}