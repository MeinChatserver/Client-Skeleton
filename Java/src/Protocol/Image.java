/**
 * Mein Chatserver
 * ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
 * Licensed Materials - Property of mein-chatserver.de.
 * © Copyright 2024. All Rights Reserved.
 *
 * @version 1.0.0
 * @author Adrian Preuß
 */

package Protocol;

import java.net.MalformedURLException;
import java.net.URL;

import Interfaces.IPacket;

public class Image implements IPacket {
	private String url = null;

	public Image(String url) {
		this.url = url;
	}

	@Override
	public String toString() {
		return "[Image " + this.url + "]";
	}

	@Override
	public String getOperation() {
		return "IMAGE";
	}

	public URL getURL() {
		try {
			return new URL("https://demo.mein-chatserver.de" + this.url);
		} catch(MalformedURLException e) {
			e.printStackTrace();
		}

		return null;
	}
}