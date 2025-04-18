/**
 * Mein Chatserver
 * ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
 * Licensed Materials - Property of mein-chatserver.de.
 * © Copyright 2024. All Rights Reserved.
 *
 * @version 1.0.0
 * @author Adrian Preuß
 */

package Protocol.Receive;

import com.fasterxml.jackson.annotation.JsonProperty;

import Protocol.Message;

public class MessageAction extends Message {
	public MessageAction(@JsonProperty("room") String room, @JsonProperty("text") String text) {
		super(room, text);
	}

	@Override
	public String getRoom() {
		return this.room;
	}

	@Override
	public String getText() {
		return this.text;
	}

	@Override
	public String toString() {
		return "[Message Type=ACTION Room=" + room + ", Text=" + text + " ]";
	}

	@Override
	public String getOperation() {
		return "MESSAGE_ACTION";
	}
}