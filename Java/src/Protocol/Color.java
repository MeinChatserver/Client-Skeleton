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

import Interfaces.IPacket;

public class Color implements IPacket {
	private String Color = null;

	public Color(boolean value) {
		/* Ignore (For JSON "enabled": true from Style-Override) */
	}

	public Color(String color) {
		this.Color = color;
	}

	@Override
	public String toString() {
		return "[Color " + this.Color + "]";
	}

	@Override
	public String getOperation() {
		return "COLOR";
	}

	public java.awt.Color getColor() {
		if(this.Color.isEmpty()) {
			return null;
		}

		return java.awt.Color.decode(this.Color);
	}
}