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

public class MessageAction extends Message {
	public MessageAction(@JsonProperty("room") String room, @JsonProperty("text") String text) {
		super(room, text);
	}

	public String getRoom() {
		return this.room;
	}

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