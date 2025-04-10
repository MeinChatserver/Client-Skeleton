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

public class LoginStyle implements IPacket {
	@JsonProperty("background")
	private Protocol.Color background;

	@JsonProperty("foreground")
	private Protocol.Color foreground;

	@JsonProperty("backgroundList")
	private Protocol.Color backgroundList;

	@JsonProperty("foregroundList")
	private Protocol.Color foregroundList;

	@JsonProperty("backgroundImage")
	private Protocol.Image backgroundImage;

	public LoginStyle(@JsonProperty("background") Protocol.Color background, @JsonProperty("foreground") Protocol.Color foreground, @JsonProperty("backgroundList") Protocol.Color backgroundList, @JsonProperty("foregroundList") Protocol.Color foregroundList, @JsonProperty("backgroundImage") Protocol.Image backgroundImage) {
		this.background = background;
		this.foreground = foreground;
		this.backgroundList = backgroundList;
		this.foregroundList = foregroundList;
		this.backgroundImage = backgroundImage;
	}

	public Color getBackground() {
		return this.background;
	}

	public Color getForeground() {
		return this.foreground;
	}

	public Color getBackgroundList() {
		return this.backgroundList;
	}

	public Color getForegroundList() {
		return this.foregroundList;
	}

	public Image getBackgroundImage() {
		return this.backgroundImage;
	}

	@Override
	public String toString() {
		return "[LoginStyle]";
	}

	@Override
	public String getOperation() {
		return "LOGIN_STYLE";
	}
}