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
import Chatroom from './Chatroom.js';
import Components from './Components.js';

export default (new class WindowManager {
	Frames = [];
	Chatrooms = [];

	/**
	 * Entfernt einen Frame aus der Verwaltung
	 */
	removeFrame(frame) {
		this.Frames = this.Frames.filter(entry => entry !== frame);
	}

	/**
	 * Gibt die Liste aller Chaträume zurück
	 */
	getRoomList() {
		return this.Chatrooms;
	}

	/**
	 * Erstellt ein neues Chatroom-Fenster
	 */
	create(name, width, height) {
		if(this.exists(name)) {
			const existing = this.get(name);
			existing.close();
			this.removeFrame(existing);
		}

		const frame = new Chatroom(name, {
			width: width || 800,
			height: height || 600
		});

		this.Frames.push(frame);

		if(frame.getReadyState() === 'loading') {
			frame.getDocument().addEventListener('DOMContentLoaded', () => {
				frame.init();
			});
		} else {
			frame.init();
		}

		return frame;
	}

	/**
	 * Erstellt ein neues Popup-Fenster
	 */
	createPopup(name, width, height, elements) {
		if(this.exists(name)) {
			const existing = this.get(name);
			existing.focus();
			return existing;
		}

		const popup = new Popup(name, {
			width: width,
			height: height,
			titlebar: true
		});

		this.Frames.push(popup);

		if(popup.getReadyState() === 'loading') {
			popup.getDocument().addEventListener('DOMContentLoaded', () => {
				this.#initPopupContent(popup, elements);
			});
		} else {
			this.#initPopupContent(popup, elements);
		}

		return popup;
	}

	/**
	 * Initialisiert den Inhalt eines Popups
	 * @private
	 */
	#initPopupContent(popup, elements) {
		if(elements && Array.isArray(elements)) {
			elements.sort((a, b) => (a.order || 0) - (b.order || 0));

			const body = popup.getDocument().body;

			if(body) {
				Components.render(elements, body);
			}
		}

		popup.init();
	}

	/**
	 * Lädt ein Stylesheet in ein Dokument
	 */
	load(target, file) {
		return new Promise((resolve, reject) => {
			const style = target.createElement('link');
			style.rel = 'stylesheet';
			style.type = 'text/css';
			style.href = import.meta.resolve(file) + '?t=' + Date.now();
			style.onload = () => resolve(target, file);
			style.onerror = () => reject(new Error(`Failed to load ${file}`));

			target.head.appendChild(style);
		});
	}

	/**
	 * Prüft ob ein Fenster mit dem Namen existiert
	 */
	exists(name) {
		return this.Frames.some(frame => frame.getName() === name);
	}

	/**
	 * Gibt ein Fenster mit dem Namen zurück
	 */
	get(name) {
		return this.Frames.find(frame => frame.getName() === name) ?? null;
	}

	/**
	 * Schließt alle verwalteten Fenster
	 */
	closeAll() {
		const framesToClose = [...this.Frames];
		this.Frames = [];

		framesToClose.forEach(frame => {
			try {
				if(frame && typeof frame.close === 'function') {
					frame.close();
				}
			} catch(e) {
				console.error('Error closing frame:', e);
			}
		});
	}

	/**
	 * Gibt alle verwalteten Fenster zurück
	 */
	getAll() {
		return this.Frames;
	}

	/**
	 * Setzt alle Fenster auf "verbunden"
	 */
	setConnected() {
		this.Frames.forEach(frame => {
			if(typeof frame.setConnected === 'function') {
				frame.setConnected();
			}
		});
	}

	/**
	 * Setzt alle Fenster auf "getrennt"
	 */
	setDisconnected() {
		this.Frames.forEach(frame => {
			if(typeof frame.setDisconnected === 'function') {
				frame.setDisconnected();
			}
		});
	}

	/**
	 * Löscht alle Chaträume aus der Liste
	 */
	clearChatrooms() {
		this.Chatrooms = [];
	}

	/**
	 * Fügt einen Chatraum zur Liste hinzu
	 */
	addChatroom(room) {
		if(!room || !room.id || !room.name) {
			console.warn('Invalid chatroom data:', room);
			return;
		}

		const exists = this.Chatrooms.some(r => r.id === room.id);

		if(exists) {
			console.warn(`Chatroom ${room.name} already exists`);
			return;
		}

		this.Chatrooms.push({
			id: room.id,
			name: room.name
		});
	}

	/**
	 * Entfernt einen Chatraum aus der Liste
	 */
	removeChatroom(roomId) {
		this.Chatrooms = this.Chatrooms.filter(room => room.id !== roomId);
	}

	/**
	 * Aktualisiert die Theme-Einstellung für alle Fenster
	 */
	updateTheme(theme) {
		this.Frames.forEach(frame => {
			try {
				const doc = frame.getDocument();

				if(doc && doc.documentElement) {
					doc.documentElement.dataset.theme = theme;
				}
			} catch(e) {
				console.error('Error updating theme for frame:', e);
			}
		});
	}
}());