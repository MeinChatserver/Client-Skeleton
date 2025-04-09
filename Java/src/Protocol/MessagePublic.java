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

public class MessagePublic extends Message {
	@JsonProperty("sender")
	private User sender;

	public MessagePublic(@JsonProperty("room") String room, @JsonProperty("sender") User sender, @JsonProperty("text") String text) {
		super(room, text);

		this.sender = sender;
	}

	public String getRoom() {
		return this.room;
	}

	public User getSender() {
		return this.sender;
	}

	public String getText() {
		return this.text;
	}

	@Override
	public String toString() {
		return "[Message Type=PUBLIC Room=" + room + ", Sender=" + sender + ", Text=" + text + " ]";
	}

	@Override
	public String getOperation() {
		return "MESSAGE_PUBLIC";
	}
}