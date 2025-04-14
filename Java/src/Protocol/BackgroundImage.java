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

import java.io.IOException;
import java.net.URL;

import javax.imageio.ImageIO;

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

	public java.awt.Image getImage() {
		try {
			URL url = this.file.getURL();

			if(url != null) {
				return ImageIO.read(url);
			}
		} catch(IOException ex) {
			ex.printStackTrace();
		}

		return null;
	}
}