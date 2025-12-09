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

import List from './List.js';

export default (new class WindowManager {
	Frames      = [];
    Chatrooms   = [];

	create(name, width, height) {
		if(this.exists(name)) {
			return this.get(name);
		}
		
		let options		= {
			name:		name,
			location:	false,
			toolbar:	false,
			menubar:	false,
			status:		false,
			width:		width,
			height:		height,
			popup:		true
		};
		
		let frame		= window.open('', '_blank', Object.entries(options).map(([ key, value ]) => key + '=' + value).join(','));
		
		if(!frame) {
			alert('Cant create Popup. Popup-Blocker active?');
			return;
		}
		
		frame.console			= window.top.console;
		frame.name				= name;
		frame.document.Client	= Client;
		this.Frames.push(frame);
		
		if(frame.document.readyState === 'loading') {
			frame.document.addEventListener('DOMContentLoaded', (event) => () => {
				Client.send({
					operation:	'WINDOW_INIT',
					data:		name
				});
			});
		} else {
			Client.send({
				operation:	'WINDOW_INIT',
				data:		name
			});
		}
		
		frame.addEventListener('beforeunload', (event) => {
			Client.send({
				operation:	'WINDOW_CLOSE',
				data:		name
			});
		});
		
		const head			    				= frame.document.head || frame.document.querySelector('head');
		const body								= frame.document.body || frame.document.querySelector('body');
		const template		           			= document.querySelector('template[name="room"]');
		const clone			            		= template.content.cloneNode(true);
		const output		                    = clone.querySelector('main ui-output');
		const userlist		                    = clone.querySelector('aside');
		const roomList		                    = clone.querySelector('aside select');
		const input			                    = clone.querySelector('main ui-input input');
		body.dataset.view	                    = 'room';
		body.ondragstart	                    = (event) => { event.preventDefault(); return false; };
		body.ondrop			                    = (event) => { event.preventDefault(); return false; };
		userlist.addEventListener('contextmenu', (event) => { event.preventDefault(); return false; }, true);
		output.addEventListener('contextmenu', (event) => { event.preventDefault(); return false; }, true);

        /* Rooms-Selection */
        const rooms = new List(roomList, this.Chatrooms, {
            value:          'id',
            label:          'name',
            placeholder:    'Chatraum wechseln...',
            onChange:       (item, value) => {
                Client.send({
                    operation:	'ROOM_MESSAGE',
                    data:		{
                        room:	frame.name,
                        text:	`/go ${item.name}`
                    }
                });
            }
        });

		/* Loading Animation */
		let css_loading		         = '@keyframes rotate { to { transform: rotate(360deg); } } ';
		css_loading			        += 'ui-loading { display: block; position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 10000; background: rgba(255, 255, 255, 0.9); } ';
		css_loading			        += 'ui-loading.hidden { display: none; } ';
		css_loading			        += 'ui-loading.error { display: none; } '; /* @ToDo? Error Message? */
		css_loading			        += 'ui-loading::after { display: inline-block; content: ""; left: 50%; top: 50%; position: absolute; width: 50px; height: 50px; border-radius: 50%; border: 4px solid #0D6EFD; border-right-color: transparent; animation: 0.75s linear infinite rotate; } ';
		let loading					= document.createElement('ui-loading');
		let style_loading			= document.createElement('style');
		
		body.appendChild(loading);
		head.appendChild(style_loading);

        body.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            return false;
        }, true);

        body.addEventListener('click', (event) => {
            let data = event.target.closest('[data-action]');

            if(data) {
                let action = data.dataset.action;
                let value = null;

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

		if(style_loading.styleSheet){
			style_loading.styleSheet.cssText = css_loading;
		} else {
			style_loading.appendChild(document.createTextNode(css_loading));
		}
		
		/* Set the Viewport */
		let viewport = document.createElement('meta');
		viewport.setAttribute('name',		'viewport');
		viewport.setAttribute('content',	'width=device-width, initial-scale=1, minimum-scale=1, shrink-to-fit=no');
		head.appendChild(viewport);

		Promise.all([
			'./UI/Style.css',
			'./UI/Components.css',
			'./UI/Client.css',
			'./UI/Background.css',
			'./UI/Room.css'
		].map(file => this.load(frame.document, file))).then(() => {
			setTimeout(() => {
				loading.classList.add('hidden');
			}, 500);
		}).catch((error) => {
			loading.classList.add('error');
			window.top.console.error(error);
		});

        rooms.appendTo(userlist);
		body.appendChild(clone);
        input.placeholder	= 'Gebe eine Nachricht ein...';
		input.focus();
		
		input.addEventListener('keydown', (event) => {
			if(event.keyCode === 13 || event.key === 'Enter') {
				if(input.value.trim().length >= 1) {
					let users = frame.getSelectedUsers();
					
					/* Check if users selected */
					if(users.length >=1) {
						Client.send({
							operation:	'USER_MESSAGE',
							data:		{
								room:	frame.name,
								users:	users,
								text:	input.value
							}
						});
						
					/* Otherwise a public Message */
					} else {
						Client.send({
							operation:	'ROOM_MESSAGE',
							data:		{
								room:	frame.name,
								text:	input.value
							}
						});
					}
				}
				
				input.value = '';
				input.focus();
			}
		});
		
		frame.getSelectedUsers = () => {
			let users = [];
			
			userlist.querySelectorAll('ui-list ui-entry').forEach(element => {
				if(element.dataset.active === 'true') {
					users.push(element.dataset.name);
				}
			});
			
			return users;
		};
		
		frame.change = (name, width, height) => {
			frame.name	= name;
			
			Client.send({
				operation:	'WINDOW_INIT',
				data:		name
			});
		};
		
		frame.setConnected = () => {
			input.value		= '';
			input.disabled	= false;
		};
		
		frame.setDisconnected = () => {
			input.value 	= 'Verbindung getrennt. Bitte verbinde dich neu...'; // @ToDo I18N
			input.disabled	= true;
		};
		
		frame.setStyle = (style, ranks) => {
			let styles = frame.document.documentElement.style;
				
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
							styles.setProperty('--room-background-image', 'url(https://' + Client.getHostname() + style.background.image.file + ')');
						}
						
						if(typeof(style.background.image.position) !== 'undefined' && style.background.image.position !== null) {
							output.dataset.position = style.background.image.position;
						}
					} else {
						styles.setProperty('--room-background-image', null);
					}
				}
				
				/* Output*/
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
		};
		
		frame.setTitle = (title) => {
			frame.document.title = title;
		};
		
		frame.removeUser = (user) => {
			if(typeof(user) === 'undefined' || user === null) {
				return;
			}
			
			userlist.querySelectorAll('ui-list ui-entry').forEach(element => {
				if(element.dataset.name === user.username) {
					element.parentNode.removeChild(element);
				}
			});
		};
		
		frame.addUser = (user) => {
			if(typeof(user) === 'undefined' || user === null) {
				return;
			}
			
			frame.removeUser(user);
			
			let element				= document.createElement('ui-entry');
			element.innerHTML		= user.username;
			element.dataset.name	= user.username;
			
			if(!(typeof(user.rank) === 'undefined' || user.rank === null)) {
				element.style.color		= 'var(--rank_' + user.rank + ')';
			}
			
			element.addEventListener('click', () => {
				element.dataset.active = (element.dataset.active === 'true' ? 'false' : 'true');
			}, true);
			
			element.addEventListener('contextmenu', () => {
				Client.send({
					operation:	'PROFILE_OPEN',
					data:		element.dataset.name
				});
			}, true);
			
			userlist.querySelector('ui-list ').appendChild(element);
		};
		
		frame.addMessage = (type, data) => {
			let link;
			const scrolling		= output.scrollTop + output.clientHeight >= output.scrollHeight - 10;
			var wrapper			= document.createElement('p');
			let username		= (typeof(data.sender) === 'undefined' || data.sender === null ? 'System' : (typeof(data.sender.username) === 'undefined' ? 'System' : data.sender.username));
			let message			= document.createElement('span');
			message.innerHTML	= data.text;
			link				= document.createElement('a');
			link.classList.add('sender');
			
			switch(type) {
				case 'private':
					let target = '';
					
					if(username !== 'System' && data.users.length >= 1) {
						target = ' an ' + data.users.join(', ');
					}
					
					link.innerText	= username + ' (privat' + target + '): ';
					wrapper.appendChild(link);			
				break;
				case 'public':
					link.innerText	= username + ': ';
					wrapper.appendChild(link);
				break;
			}
			
			wrapper.appendChild(message);
			
			let element = document.createElement('ui-text');
			element.dataset.type	= type;
			element.innerHTML		= wrapper.innerHTML; // @ToDo FormattedText-Parser
			output.appendChild(element);
			
			/* Scrolling */
			if(scrolling) {
				output.scrollTop = output.scrollHeight;
			}
		};

        frame.handleRooms = (list) => {
            rooms.add({ id: 1, name: 'Frankreich', code: 'FR' });
        };
		
		return frame;
	}
	
	load(target, file) {
		return new Promise((resolve, reject) => {
			const style		= target.createElement('link');
			style.rel		= 'stylesheet';
			style.type		= 'text/css';
			style.href		= (window.location.origin !== 'file://' ? window.location.origin : '') + file + '?t=' + Date.now();
			style.onload	= () => resolve(target, file);
			style.onerror	= () => reject(new Error(`Failed to load ${file}`));

			target.head.appendChild(style);
		});
	}
	
	exists(name) {
		let found = false;
		
		this.Frames.forEach((frame) => {
			if(found) {
				return;
			}
			
			if(frame.name === name) {
				found = true;
			}
		});
		
		return found;
	}
	
	get(name) {
		let found = null;
		
		this.Frames.forEach((frame) => {
			if(found) {
				return;
			}
			
			if(frame.name === name) {
				found = frame;
			}
		});
		
		return found;
	}
	
	closeAll() {
		this.Frames.forEach((frame) => {
			frame.close();
		});
		
		this.Frames = [];
	}
	
	getAll() {
		return this.Frames;
	}
	
	setConnected() {
		this.Frames.forEach((frame) => {
			frame.setConnected();
		});
	}
	
	setDisconnected() {
		this.Frames.forEach((frame) => {
			frame.setDisconnected();
		});
	}

    clearChatrooms() {
        this.Chatrooms = [];
    }

    addChatroom(room) {
        if(room === null) {
            return;
        }

        this.Chatrooms.push({
            id:     room.id,
            name:   room.name
        });
    }
}());