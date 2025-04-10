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

public class Message implements IPacket {
	@JsonProperty("room")
	protected String room;

	@JsonProperty("text")
	protected String text;

	public Message(@JsonProperty("room") String room, @JsonProperty("text") String text) {
		this.room = room;
		this.text = text;
	}

	public String getRoom() {
		return this.room;
	}

	public String getText() {
		return this.text;
	}

	@Override
	public String toString() {
		return "[Message Room=" + room + ", Text=" + text + " ]";
	}

	@Override
	public String getOperation() {
		return "MESSAGE";
	}
}