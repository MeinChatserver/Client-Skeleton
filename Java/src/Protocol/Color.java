/**
 * Mein Chatserver
 * ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
 * Licensed Materials - Property of mein-chatserver.de.
 * © Copyright 2024. All Rights Reserved.
 *
 * @version 1.0.0
 * @author  Adrian Preuß
 */

package Protocol;

public class Color implements IPacket {
	private String color = null;
	
    public Color(String color) {
		this.color = color;
	}

	@Override
    public String toString() {
        return "[Color " + this.color + "]";
    }

	@Override
	public String getOperation() {
		return "COLOR";
	}

	public java.awt.Color getColor() {
		if(this.color.isEmpty()) {
			return null;
		}
		
		return java.awt.Color.decode(this.color);
	}
}