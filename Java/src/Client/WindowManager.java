/**
 * Mein Chatserver
 * ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
 * Licensed Materials - Property of mein-chatserver.de.
 * © Copyright 2024. All Rights Reserved.
 *
 * @version 1.0.0
 * @author Adrian Preuß
 */

package Client;

import java.awt.Dimension;
import java.util.concurrent.ConcurrentHashMap;

import Client.UI.Chatroom;
import Interfaces.IChatroom;

public class WindowManager {
	private static ConcurrentHashMap<String, Chatroom> frames = new ConcurrentHashMap<>();

	public static Chatroom create(Client client, String name, int width, int height) {
		if(exists(name)) {
			return get(name);
		}

		Chatroom window = new Chatroom(client);
		window.setSize(new Dimension(width, height));
		window.setName(name);
		window.init();

		add(name, window);

		return window;
	}

	public static boolean exists(String name) {
		synchronized(frames) {
			return frames.containsKey(name);
		}
	}

	public static void remove(String name) {
		synchronized(frames) {
			frames.entrySet().stream().forEach(entry -> {
				Chatroom window = (entry.getValue());

				if(window.getName().equals(name)) {
					frames.remove(entry.getKey());
				}
			});
		}
	}

	public static void add(String name, Chatroom window) {
		synchronized(frames) {
			frames.put(name, window);
		}
	}

	public static Chatroom get(String name) {
		synchronized(frames) {
			return frames.get(name);
		}
	}

	public static void closeAll() {
		synchronized(frames) {
			frames.entrySet().stream().forEach(entry -> {
				Chatroom window = (entry.getValue());
				window.close();
			});

			frames.clear();
		}
	}

	public static void each(IChatroom callback) {
		synchronized(frames) {
			frames.entrySet().stream().forEach(entry -> {
				callback.execute(entry.getValue());
			});
		}
	}

	public static void setConnected() {
		synchronized(frames) {
			frames.entrySet().stream().forEach(entry -> {
				entry.getValue().setConnected();
			});
		}
	}

	public static void setDisconnected() {
		synchronized(frames) {
			frames.entrySet().stream().forEach(entry -> {
				entry.getValue().setDisconnected();
			});
		}
	}
}
