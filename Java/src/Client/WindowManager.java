/**
 * Mein Chatserver
 * ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
 * Licensed Materials - Property of mein-chatserver.de.
 * © Copyright 2024. All Rights Reserved.
 *
 * @version 1.0.0
 * @author  Adrian Preuß
 */

package Client;

import java.awt.Dimension;
import java.util.concurrent.ConcurrentHashMap;

import Client.UI.Window;

public class WindowManager {
	private static ConcurrentHashMap<String, Window> frames	= new ConcurrentHashMap<String, Window>();

	public static Window create(Client client, String name, int width, int height) {
		if(exists(name)) {
			return get(name);
		}
		
		Window window = new Window(client);
		window.setSize(new Dimension(width, height));
		window.setName(name);
		window.init();
		frames.put(name, window);

		return window;
	}
	
	public static boolean exists(String name) {
		return frames.containsKey(name);
	}
	
	public static void remove(String name) {
		frames.entrySet().stream().forEach(entry -> {
		    Window window = ((Window) entry.getValue());
		    
		    if(window.getName().equals(name)) {
		    	frames.remove(entry.getKey());
		    }
		});
	}
	
	public static Window get(String name) {
		synchronized(frames) {
			return frames.get(name);			
		}
	}
	
	public static void closeAll() {
		frames.entrySet().stream().forEach(entry -> {
			Window window = ((Window) entry.getValue());
		    window.close();
		});
		
		frames.clear();
	}
	
	public static Window[] getAll() {
		return (Window[]) frames.values().toArray();
	}

	public static void setConnected() {
		frames.entrySet().stream().forEach(entry -> {
		    ((Window) entry.getValue()).setConnected();
		});
	}

	public static void setDisconnected() {
		frames.entrySet().stream().forEach(entry -> {
		    ((Window) entry.getValue()).setDisconnected();
		});
	}
}
