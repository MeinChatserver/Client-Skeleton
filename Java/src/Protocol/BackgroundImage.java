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

import com.fasterxml.jackson.annotation.JsonProperty;

import Interfaces.IPacket;

public class BackgroundImage implements IPacket {
	@JsonProperty("file")
	private Image file;

	@JsonProperty("position")
	private BackgroundPosition position;

	public BackgroundImage(@JsonProperty("file") Image file, @JsonProperty("position") BackgroundPosition position) {
		this.file = file;
		this.position = position;
	}

	@Override
	public String toString() {
		return "[BackgroundImage File=" + file + ", Position=" + position + " ]";
	}

	@Override
	public String getOperation() {
		return "BACKGROUND_IMAGE";
	}

	public BufferedImage getImage() {
		return this.file.getImage();
	}

	public BackgroundPosition getPosition() {
		return this.position;
	}
}