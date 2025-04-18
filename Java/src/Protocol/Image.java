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

import java.awt.image.BufferedImage;

import Client.ImageCache;
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

	public BufferedImage getImage() {
		return ImageCache.getInstance().getImage("https://demo.mein-chatserver.de" + this.url);
	}
}