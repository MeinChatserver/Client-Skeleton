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

import I18N from './I18N.js';

export default (new class Login {
	Watcher			= null;
	Container		    = null;
	RoomList		    = null;
	SelectCategory  	= null;
	InputUsername	    = null;
	InputPassword	    = null;
	InputRoom		    = null;
	ButtonLogin		= null;
	
	constructor() {	
		this.Container = document.querySelector('body[data-view="login"]');
		
		/* Form */
		let main			= document.createElement('main');
		let grid			= document.createElement('ui-grid');
		let panel_north	= document.createElement('ui-panel');
		let panel_center	= document.createElement('ui-panel');
		let panel_south	= document.createElement('ui-panel');
		this.SelectCategory	= document.createElement('select');
		this.InputUsername	= document.createElement('input');
		this.InputPassword	= document.createElement('input');
		this.InputRoom		= document.createElement('input');
		this.ButtonLogin	= document.createElement('button');
		
		panel_north.dataset.position	= 'north';
		panel_north.appendChild(this.addForm('categories', 'Category', this.SelectCategory));
		
		this.SelectCategory.addEventListener('change', this.onCategorySelect.bind(Login), true);
					
		this.InputPassword.type			= 'password';
		panel_center.dataset.position	= 'center';
		panel_center.appendChild(this.addForm('username', 'Username', this.InputUsername));
		panel_center.appendChild(this.addForm('password', 'Password', this.InputPassword));
		panel_center.appendChild(this.addForm('chatroom', 'Chatroom', this.InputRoom));
		
		this.InputUsername.addEventListener('keydown', (event) => {
			if(event.keyCode === 13 || event.key === 'Enter') {
				this.InputPassword.focus();
			}
		});
		
		this.InputPassword.addEventListener('keydown', (event) => {
			if(event.keyCode === 13 || event.key === 'Enter') {
				this.onLogin();
			}
		});
		
		panel_south.dataset.position	= 'south';
        this.ButtonLogin.innerText		= I18N._('Connect...').binding(this.ButtonLogin, 'innerText');
		this.ButtonLogin.addEventListener('click', this.onLogin.bind(this), true);
		
		panel_south.appendChild(this.ButtonLogin);
		grid.appendChild(panel_north);
		grid.appendChild(panel_center);
		grid.appendChild(panel_south);
		main.appendChild(grid);
		this.Container.appendChild(main);
		
		/* Rooms */
		let aside		= document.createElement('aside');
		let tabs		= document.createElement('ui-tabs');
		let tab			= document.createElement('ui-tab');
		let tab_input	= document.createElement('input');
		let tab_label	= document.createElement('label');
		this.RoomList	= document.createElement('div');
		
		tab_input.type		= 'radio';
		tab_input.id		= 'tab1';
		tab_input.name		= 'tabs';
		tab_input.checked	= true;
		
		tab_label.htmlFor	= 'tab1';
		tab_label.innerText	= I18N._('Rooms').binding(tab_label, 'innerText');
		
		this.RoomList.dataset.state	= '';
		this.RoomList.id			= 'tab-content1';
		this.RoomList.classList.add('content');
		
		tab.appendChild(tab_input);
		tab.appendChild(tab_label);
		tab.appendChild(this.RoomList);
		tabs.appendChild(tab);
		aside.appendChild(tabs);
		this.Container.appendChild(aside);
		
		this.addCategory({ id: 0, name: 'All Chatrooms' });
	}
	
	addForm(name, text, element) {
		let form	    = document.createElement('ui-form');
		let label	= document.createElement('label');
		
		element.id		= name;
		element.name	= name;
		
		label.for		= name;
		label.innerText	= I18N._(text).binding(label, 'innerText') + ':';
		
		form.appendChild(label);
		form.appendChild(element);
		return form;
	}

    enableEnterButton() {
        this.ButtonLogin.disabled   = false;
        this.ButtonLogin.innerHTML	= I18N._('Login').binding(this.ButtonLogin, 'innerHTML');
    }

	setConnected() {
        if(this.Watcher) {
            clearInterval(this.Watcher);
            this.Watcher = null;
        }

		this.RoomList.dataset.state = '';
		this.RoomList.innerHTML		= '&nbsp;';
		this.ButtonLogin.innerHTML	= I18N._('Login').binding(this.ButtonLogin, 'innerHTML');
        this.ButtonLogin.disabled   = false;
	}
	
	setDisconnected() {
        if(this.Watcher) {
            clearInterval(this.Watcher);
            this.Watcher = null;
        }

        this.RoomList.innerHTML		= '';
		this.RoomList.dataset.state = I18N._('Connection lost').binding(this.RoomList, 'dataset.state');
		this.ButtonLogin.innerHTML	= I18N._('Reconnect').binding(this.ButtonLogin, 'innerHTML');
        this.ButtonLogin.disabled   = false;
		let seconds		    = 30;
		this.Watcher	= setInterval(() => {
			if(seconds <= 1) {
				seconds = 1;
			}
			
			this.RoomList.dataset.state = 'Versuche erneut zu verbinden (' + --seconds + 's).';
		}, 1000);
	}

	showLoginButton() {
		this.RoomList.dataset.state = '';
	}
	
	clearCategories() {
		this.SelectCategory.innerHTML	= '';
	}
	
	addCategory(category) {
		let option		= document.createElement('option');
		option.value		            = category.id;
		option.textContent	            = I18N._(category.name).binding(option, 'textContent');
		this.SelectCategory.appendChild(option);
	}
	
	emptyChatrooms() {
		this.RoomList.innerHTML = '&nbsp;';
	}
	
	addChatroom(room) {
        if(!room?.name) {
            return;
        }
		
		try {
			let element = document.createElement('ui-entry');
            element.textContent     = `${room.name} (${room.users?.length ?? 0})`;
			element.dataset.name	= room.name;
			element.dataset.id		= room.id;
			element.addEventListener('click', this.onRoomSelect.bind(this), true);
			element.addEventListener('contextmenu', this.onRoomSelect.bind(this), true);
			
			this.RoomList.appendChild(element);
		} catch(e) {
			console.error('Room Error on addChatroom()', room);
		}
	}
	
	clearChatrooms() {
		this.RoomList.innerHTML = '';		
	}
	
	setSuggestedRoom(name) {
		this.InputRoom.value = name;
	}
	
	onLogin(event) {
		this.ButtonLogin.innerText		= I18N._('Enter...').binding(this.ButtonLogin, 'innerHTML');
		this.ButtonLogin.disabled       = true;

		Client.send({
			operation: 'LOGIN',
			data: {
				username: this.InputUsername.value,
				password: this.InputPassword.value,
				chatroom: this.InputRoom.value
			}
		});
	}
	
	onCategorySelect(event) {
		Client.send({
			operation:	'CATEGORY_CHANGE',
			data:		Number(event.target.value)
		});
	}
	
	onRoomSelect(event) {
		switch(event.button) {
			case 0:
				this.setSuggestedRoom(event.target.dataset.name);
			break;
			case 2:
				Client.send({
					operation:	'ROOM_INFO',
					data:		event.target.dataset.name
				});
			break;
		}
		
		event.preventDefault();
	}
}());