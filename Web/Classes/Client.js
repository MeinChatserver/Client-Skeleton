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
 
import Login from './Login.js';
import WindowManager from './WindowManager.js'

window.Client = (new class Client {
	Client			= 'WebChat';
	Version			= 'V1.0.1';
	Hostname	    = null;
	Port			= 2710;
	Socket		    = null;
	Ping		    = null;
	
	constructor() {
		window.addEventListener('unload', () => {
			this.disconnect(true);
		});
		
		document.querySelector('browser-compatiblity').style.display = 'none';

		this.init();
	}
	
	init() {
		console.log('%cwww.mein-chatserver.de - ' + this.Client + ' ' + this.Version, 'background: #c8c5fb; font-size: 16px; padding: 2px 10px;', 'Copyright © 2024 by Mein Chatserver. All Rights Reserved.');
		
		/* Load Hostname */
		if(window.location.protocol !== 'file:') {
			this.Hostname = window.location.hostname;
		}
		
		/* Load Defaults */
		try {
			Object.entries(window.Defaults.style).forEach(([ name, value ]) => {
				switch(name) {
					case 'backgroundImage':
						document.documentElement.style.setProperty('--login-background-image', 'url(' + value + ')');
					break;
					case 'background':
						document.documentElement.style.setProperty('--login-background', value);
					break;
					case 'foreground':
						document.documentElement.style.setProperty('--login-foreground', value);
					break;
					case 'backgroundList':
						document.documentElement.style.setProperty('--login-background-list', value);
					break;
					case 'foregroundList':
						document.documentElement.style.setProperty('--login-foreground-list', value);
					break;
					default:
						console.warn('Unsupported Parameter:', name, value);
					break;
				}
			});
			
			this.Port = window.Defaults.port;
			Login.setSuggestedRoom(window.Defaults.suggestion);
		} catch(e) {}
		
		/* Load Parameters */
		try {
			let reference = null;
			
			try {
				reference = window.parent.document;
			} catch(e) { console.error(e); }
			
			try {
				reference = window.top.document;
			} catch(e) { console.error(e); }
			
			if(reference === null) {
				return;
			}
			
			reference.querySelectorAll('object > param').forEach(node => {
				if(node.tagName === 'PARAM') {
					let name	= node.getAttribute('name');
					let value	= node.getAttribute('value');
					
					switch(name) {
						case 'backgroundImage':
							document.documentElement.style.setProperty('--login-background-image', 'url(' + value + ')');
						break;
						case 'background':
							document.documentElement.style.setProperty('--login-background', value);
						break;
						case 'foreground':
							document.documentElement.style.setProperty('--login-foreground', value);
						break;
						case 'backgroundList':
							document.documentElement.style.setProperty('--login-background-list', value);
						break;
						case 'foregroundList':
							document.documentElement.style.setProperty('--login-foreground-list', value);
						break;
						case 'suggestion':
							Login.setSuggestedRoom(value);
						break;
						case 'port':
							this.Port = value;
						break;
						default:
							console.warn('Unsupported Parameter:', name, value);
						break;
					}
				}
			});
		} catch(e) {
			console.error(e);
		}
		
		/* Prepare Socket */
		this.connect();
	}
	
	getHostname() {
		/* Fix Demo */
		if(this.Hostname === null || this.Hostname.length === 0 || this.Hostname === 'www.mein-chatserver.de') {
			this.Hostname = 'demo.mein-chatserver.de';
		}
		
		return this.Hostname;
	}
	
	getPort() {
		return this.Port;
	}
	
	connect(hard) {
		if(hard) {
			this.disconnect();
		}
		
		this.Socket				= new WebSocket(`wss://${this.getHostname()}:${this.getPort()}/`);
		this.Socket.onopen		= this.onOpen.bind(this);
		this.Socket.onclose		= this.onClose.bind(this);
		this.Socket.onerror		= this.onError.bind(this);
		this.Socket.onmessage	= this.onReceive.bind(this);
	}
	
	disconnect(hard) {
		/* Sending Disconnect */
		if(this.Socket !== null) {
			this.send({
				operation: 'DISCONNECT'
			});
		}
		
		/* Close all Frames */
		if(hard) {
			WindowManager.closeAll();
		}
		
		/* Close the Socket */
		if(this.Socket !== null) {
			if(this.Socket.readyState === WebSocket.OPEN) {
				this.Socket.close();
			}
			
			this.Socket = null;
		}
	}
	
	isConnected() {
		if(this.Socket == null) {
			return false;
		}
		
		if(this.Socket.readyState === this.Socket.CLOSED){
			return false;
		}
		
		return (this.Socket.readyState === this.Socket.OPEN);
	}
	
	send(packet) {
		if(!this.isConnected()) {
			return;
		}
		
		this.Socket.send(JSON.stringify(packet));
	}
	
	onOpen() {
		WindowManager.setConnected();
		Login.setConnected();
		console.log('Connected...');
		
		if(this.Ping) {
			clearInterval(this.Ping);
		}
		
		this.send({
			operation: 'HANDSHAKE',
			data: {
				client:		this.Client,
				version:	this.Version,
				location:	window.top.location.href,
				useragent:	navigator.userAgent
			}
		});
	}
	
	onClose(event) {
		if(this.Ping) {
			clearInterval(this.Ping);
		}
		
		this.disconnect();
		
		WindowManager.setDisconnected();
		Login.setDisconnected();
		
		setTimeout(() => {
			this.connect();
		}, 10000);
		
		console.warn('WebSocket: onClose', event);
	}
	
	onError(event) {
		console.warn('WebSocket: onError', event, event.code);
	}
	
	onReceive(event) {
		let room	= null;
		let frame	= null;
		
		console.warn('WebSocket: onReceive', event, event.data);
		
		try {
			let packet = JSON.parse(event.data.toString());
			
			if(typeof(packet.operation) == 'undefined') {
				console.error('Unknown Packet', packet);
				return;
			}
			
			switch(packet.operation) {
				case 'CONFIGURATION':
					Login.showLoginButton();
					
					if(typeof(packet.data.suggestion) !== 'undefined') {
						Login.setSuggestedRoom(packet.data.suggestion);
					}
					
					this.Ping = setInterval(() => {
						this.send({
							operation: 'PING'
						});
					}, 10000);
				break;
				case 'PING':
					this.send({
						operation:	'PONG'
					});
				break;
				case 'PONG':
					// @ToDo
				break;
				case 'POPUP':
					alert(packet.data);
				break;
				case 'ROOMS_CATEGORIES':
                    WindowManager.clearChatrooms();
					Login.clearCategories();
					Login.addCategory({ id: 0, name: 'Alle Chaträume' });
					packet.data.forEach(Login.addCategory.bind(Login));
				break;
				case 'ROOMS':
					if(packet.data.length === 0) {
						Login.emptyChatrooms();
					} else {
						Login.clearChatrooms();
                        WindowManager.clearChatrooms();
						packet.data.forEach(Login.addChatroom.bind(Login));
						packet.data.forEach(WindowManager.addChatroom.bind(WindowManager));
					}
				break;
				case 'WINDOW_ROOM':
					frame = WindowManager.create(packet.data.name, packet.data.width, packet.data.height);
					frame.setTitle(packet.data.title);
					frame.setStyle(packet.data.room.style, packet.data.ranks);
					frame.focus();
				break;
                case 'WINDOW_ROOM_CLOSE':
                    if(packet.data === '-') {
                        WindowManager.closeAll();
                        return;
                    }

                    frame = WindowManager.get(packet.data);

                    if(frame !== null) {
                        frame.close();
                    }
                break;
				case 'WINDOW_ROOM_UPDATE':
					frame = WindowManager.get(packet.data.reference);

                    if(frame !== null) {
                        frame.change(packet.data.name, packet.data.width, packet.data.height);
                        frame.setTitle(packet.data.title);
                        frame.setStyle(packet.data.room.style, packet.data.ranks);
                        frame.focus();
                    }
				break;
				case 'ROOM_UPDATE':
					frame = WindowManager.get(packet.data.name);
					
					if(frame !== null) {
                        for(let user of packet.data.users) {
							frame.addUser(user);
						}
						
						if(packet.data.style) {
							frame.setStyle(packet.data.style, packet.data.ranks);
						}
					}
				break;
				case 'ROOM_USER_ADD':
					frame = WindowManager.get(packet.data.room);
					
					if(frame !== null) {
						frame.addUser(packet.data.user);
					}
				break;
				case 'ROOM_USER_REMOVE':
					frame = WindowManager.get(packet.data.room);
					
					if(frame !== null) {
						frame.removeUser(packet.data.user);
					}
				break;
				case 'MESSAGE_PRIVATE':					
					if(typeof(packet.data.room) !== 'undefined') {
						room = packet.data.room;
						
						if(room === '-') {
							room = null;
						}
					}
				
					/* Publish on all rooms */
					if(room === null) {
						WindowManager.getAll().forEach((frame) => {
							frame.addMessage('private', packet.data);
						});
					
					/* Publish on single room */
					} else {
						frame = WindowManager.get(packet.data.room);
					
						if(frame !== null) {
							frame.addMessage('private', packet.data);
						}
					}
				break;
				case 'MESSAGE_ACTION':					
					if(typeof(packet.data.room) !== 'undefined') {
						room = packet.data.room;
						
						if(room === '-') {
							room = null;
						}
					}
				
					/* Publish on all rooms */
					if(room === null) {
						WindowManager.getAll().forEach((frame) => {
							frame.addMessage('action', packet.data);
						});
					
					/* Publish on single room */
					} else {
						frame = WindowManager.get(packet.data.room);
					
						if(frame !== null) {
							frame.addMessage('action', packet.data);
						}
					}
				break;
				case 'MESSAGE_PUBLIC':					
					if(typeof(packet.data.room) !== 'undefined') {
						room = packet.data.room;
						
						if(room === '-') {
							room = null;
						}
					}
				
					/* Publish on all rooms */
					if(room === null) {
						WindowManager.getAll().forEach((frame) => {
							frame.addMessage('public', packet.data);
						});
					
					/* Publish on single room */
					} else {
						frame = WindowManager.get(packet.data.room);
					
						if(frame !== null) {
							frame.addMessage('public', packet.data);
						}
					}
				break;
				default:
					console.warn('Unknown Operation:', packet.operation, packet.data);
				break;
			}
		} catch(e) {
			console.error('Error', e);
		}
	}
}());