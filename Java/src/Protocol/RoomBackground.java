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

import com.fasterxml.jackson.annotation.JsonProperty;

import Interfaces.IPacket;

public class RoomBackground implements IPacket {
	@JsonProperty("color")
	private Color color;

	@JsonProperty("image")
	private BackgroundImage image;

	public RoomBackground(@JsonProperty("color") Color color, @JsonProperty("image") BackgroundImage image) {
		this.color = color;
		this.image = image;
	}

	@Override
	public String toString() {
		return "[RoomBackground Color=" + color + ", Image=" + image + " ]";
	}

	@Override
	public String getOperation() {
		return "ROOM_BACKGROUND";
	}

	public java.awt.Color getColor() {
		return this.color.getColor();
	}

	public BackgroundImage getImage() {
		return this.image;
	}
}