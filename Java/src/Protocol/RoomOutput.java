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

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import Interfaces.IPacket;

@JsonIgnoreProperties(ignoreUnknown = true)
public class RoomOutput implements IPacket {
	@JsonProperty("red")
	private Protocol.Color Red;

	@JsonProperty("blue")
	private Protocol.Color Blue;

	@JsonProperty("green")
	private Protocol.Color Green;

	@JsonProperty("default")
	private Protocol.Color Default;

	public RoomOutput(@JsonProperty("red") Protocol.Color red, @JsonProperty("blue") Protocol.Color blue, @JsonProperty("green") Protocol.Color green, @JsonProperty("default") Protocol.Color defaults) {
		this.Red = red;
		this.Blue = blue;
		this.Green = green;
		this.Default = defaults;
	}

	public Color getRed() {
		return this.Red;
	}

	public Color getBlue() {
		return this.Blue;
	}

	public Color getGreen() {
		return this.Green;
	}

	public Color getDefault() {
		return this.Default;
	}

	@Override
	public String toString() {
		return "[RoomOutput Red=" + this.Red + ", Green=" + this.Green + ", Blue=" + this.Blue + ", Default=" + this.Default + "]";
	}

	@Override
	public String getOperation() {
		return "ROOM_OUTPUT";
	}
}