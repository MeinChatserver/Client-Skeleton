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

import Popup from './Popup.js';
import List from './List.js';

/* Features */
import Snow from './Features/Room/Snow.js';
import Glow from './Features/List/Glow.js';
import Burn from './Features/List/Burn.js';
import WindowManager from './WindowManager.js';


export default class Chatroom extends Popup {
    Features = [];
    Side = null;
    Template = null;
    Input = null;
    Output = null;
    Userlist = null;
    Messages = null;
    RoomList = null;
    Rooms = null;
    isReady = false;

    constructor(name, options = {}) {
        super(name, {
            width: options.width || 800,
            height: options.height || 600,
            titlebar: false,
            showLoading: true,
            ...options
        });
    }

    initContent() {
        super.initContent();

        const template = document.querySelector('template[name="room"]');

        if(!template) {
            console.error('Room template not found!');
            return;
        }

        this.Template = template.content.cloneNode(true);
        this.Output = this.Template.querySelector('main ui-output');
        this.Messages = this.Output.querySelector('ui-messages');
        this.Side = this.Template.querySelector('aside');
        this.Userlist = this.Side.querySelector('ui-list');
        this.RoomList = this.Side.querySelector('select');
        this.Input = this.Template.querySelector('main ui-input input');

        this.Body.dataset.view = 'room';

        this.Userlist.addEventListener('contextmenu', this.void, true);
        this.Messages.addEventListener('contextmenu', this.void, true);

        // Rooms-Selection
        this.Rooms = new List(this.RoomList, WindowManager.getRoomList(), {
            value: 'id',
            label: 'name',
            placeholder: 'Chatraum wechseln...',
            onChange: (item, value) => {
                Client.send({
                    operation: 'ROOM_MESSAGE',
                    data: {
                        room: this.getName(),
                        text: `/go ${item.name}`
                    }
                });
            }
        });

        this.Rooms.appendTo(this.Side);

        this.Body.appendChild(this.Template);
        this.Input.placeholder = 'Gebe eine Nachricht ein...';
        this.Input.focus();

        this.Input.addEventListener('keydown', (event) => {
            if(event.keyCode === 13 || event.key === 'Enter') {
                if(!this.Input || this.Input.value.trim().length < 1) {
                    return;
                }

                let users = this.getSelectedUsers();

                /* Check if users selected */
                if(users.length >= 1) {
                    Client.send({
                        operation: 'USER_MESSAGE',
                        data: {
                            room: this.getName(),
                            users: users,
                            text: this.Input.value
                        }
                    });
                } else {
                    /* Otherwise a public Message */
                    Client.send({
                        operation: 'ROOM_MESSAGE',
                        data: {
                            room: this.getName(),
                            text: this.Input.value
                        }
                    });
                }

                this.Input.value = '';
                this.Input.focus();
            }
        });

        this.isReady = true;
    }

    change(name) {
        super.change(name);

        this.Features = this.Features.filter(feature => {
            if(typeof(feature.onDestroy) !== 'undefined') {
                feature.onDestroy();
            }

            return false;
        });
    }

    paint() {
        if(!this.Canvas) {
            return;
        }

        const context = this.getContext();

        if(context) {
            context.clearRect(0, 0, this.Canvas.width, this.Canvas.height);

            this.Features.forEach(feature => {
                if(typeof(feature.onPaint) !== 'undefined') {
                    feature.onPaint(context, this.Canvas);
                }
            });
        }

        this.Frame.requestAnimationFrame(this.paint.bind(this));
    }

    getSelectedUsers() {
        if(!this.Userlist) {
            return [];
        }

        return [...this.Userlist.querySelectorAll('ui-entry[data-active="true"]')].map(element => element.dataset.name);
    }

    setConnected() {
        if(this.Input) {
            this.Input.value = '';
            this.Input.disabled = false;
        }
    }

    setDisconnected() {
        if(this.Input) {
            this.Input.value = 'Verbindung getrennt. Bitte verbinde dich neu...'; // @ToDo I18N
            this.Input.disabled = true;
        }
    }

    setStyle(style, ranks) {
        if(!this.isReady) {
            setTimeout(() => this.setStyle(style, ranks), 100);
            return;
        }

        if(!this.Frame || !this.Frame.document) {
            return;
        }

        let styles = this.Frame.document.documentElement.style;

        /* Update Ranks */
        if(!(typeof(ranks) === 'undefined' || ranks === null)) {
            ranks.forEach((rank) => {
                styles.setProperty('--rank_' + rank.id, rank.color);
            });
        }

        /* Update Style */
        if(!(typeof(style) === 'undefined' || style === null)) {
            /* Background */
            if(typeof(style.background) !== 'undefined' && style.background !== null) {
                if(typeof(style.background.color) !== 'undefined' && style.background.color !== null) {
                    styles.setProperty('--room-background', style.background.color);
                }

                if(typeof(style.background.image) !== 'undefined' && style.background.image !== null) {
                    if(typeof(style.background.image.file) !== 'undefined' && style.background.image.file !== null) {
                        styles.setProperty('--room-background-image', `url('https://${Client.getHostname()}${style.background.image.file}')`);
                    }

                    if(typeof(style.background.image.position) !== 'undefined' && style.background.image.position !== null) {
                        if(this.Output) {
                            this.Output.dataset.position = style.background.image.position;
                        }
                    }
                } else {
                    styles.setProperty('--room-background-image', null);
                }
            }

            /* Messages */
            if(typeof(style.output) !== 'undefined' && style.output !== null) {
                if(typeof(style.output.default) !== 'undefined' && style.output.default !== null) {
                    styles.setProperty('--room-foreground', style.output.default);
                }

                [
                    'default',
                    'red',
                    'green',
                    'blue'
                ].forEach((name) => {
                    if(typeof(style.output[name]) !== 'undefined' && style.output[name] !== null) {
                        styles.setProperty('--room-' + name, style.output[name]);
                    }
                });
            }

            /* Ranks */
            if(typeof(style.ranks) !== 'undefined' && style.ranks !== null) {
                Object.entries(style.ranks).forEach(([ id, color ]) => {
                    styles.setProperty('--rank_' + id, color);
                });
            }
        }
    }

    addFeature(type, name, reference) {
        let feature = null;
        let container = null;
        let paintable = false;

        switch(name.toUpperCase()) {
            case 'SNOW':
                feature = new Snow();
                break;
            case 'GLOW':
                feature = new Glow();
                break;
            case 'BURN':
                feature = new Burn();
                break;
        }

        if(!feature) {
            console.warn(`Unknown feature: ${name}`);
            return;
        }

        switch(type) {
            case 'ROOM':
                container = this.Output;
                paintable = true;
                break;
            case 'USER':
                container = this.Userlist?.querySelector(`ui-entry[data-name="${CSS.escape(reference)}"]`);
                break;
        }

        if(!container) {
            console.warn(`Container not found for feature ${name}`);
            return;
        }

        if(paintable && this.Canvas) {
            container.appendChild(this.Canvas);
            this.Canvas.style.width = '100%';
            this.Canvas.style.height = '100%';
        }

        this.Frame.requestAnimationFrame(() => {
            this.Frame.requestAnimationFrame(() => {
                this.onResize();

                this.Features.push(feature);

                if(typeof(feature.onInit) !== 'undefined') {
                    feature.onInit(container, this.Canvas, this.Frame);
                }

                if(typeof(feature.onStart) !== 'undefined') {
                    feature.onStart();
                }
            });
        });
    }

    removeUser(user) {
        if(!user || !this.Userlist) {
            return;
        }

        this.Userlist.querySelector(`ui-entry[data-name="${CSS.escape(user.username)}"]`)?.remove();
    }

    addUser(user) {
        if(typeof(user) === 'undefined' || user === null || !this.Userlist) {
            return;
        }

        this.removeUser(user);

        let element = document.createElement('ui-entry');
        element.innerHTML = user.username;
        element.dataset.name = user.username;

        if(!(typeof(user.rank) === 'undefined' || user.rank === null)) {
            element.style.color = 'var(--rank_' + user.rank + ')';
        }

        element.addEventListener('click', () => {
            element.dataset.active = (element.dataset.active === 'true' ? 'false' : 'true');
        }, true);

        element.addEventListener('contextmenu', () => {
            Client.send({
                operation: 'PROFILE_OPEN',
                data: element.dataset.name
            });
        }, true);

        this.Userlist.appendChild(element);
    }

    addMessage(type, data) {
        if(!this.Messages) {
            return;
        }

        let link;
        const scrolling = this.Messages.scrollTop + this.Messages.clientHeight >= this.Messages.scrollHeight - 10;
        var wrapper = document.createElement('p');
        let username = (typeof(data.sender) === 'undefined' || data.sender === null ? 'System' : (typeof(data.sender.username) === 'undefined' ? 'System' : data.sender.username));
        let message = document.createElement('span');
        message.innerHTML = data.text;
        link = document.createElement('a');
        link.classList.add('sender');

        switch(type) {
            case 'private':
                let target = '';

                if(username !== 'System' && data.users.length >= 1) {
                    target = ' an ' + data.users.map(entry => {
                        // @ToDo Check current user for "Dich" output
                        return `<span data-action="profile:${entry}">${entry}</span>`;
                    }).join(', ');
                }

                link.innerHTML = username + ' (privat' + target + '): ';
                wrapper.appendChild(link);
                break;
            case 'public':
                link.innerHTML = `<span data-action="profile:${username}">${username}</span>: `;
                wrapper.appendChild(link);
                break;
        }

        wrapper.appendChild(message);

        let element = document.createElement('ui-text');
        element.dataset.type = type;
        element.innerHTML = wrapper.innerHTML; // @ToDo FormattedText-Parser
        this.Messages.appendChild(element);

        /* Scrolling */
        if(scrolling) {
            this.Messages.scrollTop = this.Messages.scrollHeight;
        }
    }

    init() {
        this.loadStylesheets([
            '../UI/Style.css',
            '../UI/Components.css',
            '../UI/Client.css',
            '../UI/Background.css',
            '../UI/Room.css',
            '../UI/Themes/Modern.css'
        ]);

        super.init();

        this.Features.forEach(feature => {
            if(typeof(feature.onStart) !== 'undefined') {
                feature.onStart();
            }
        });

        Client.send({
            operation: 'WINDOW_INIT',
            data: this.getName()
        });
    }
}