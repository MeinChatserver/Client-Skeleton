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

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import Protocol.Message;
import Protocol.User;

@JsonIgnoreProperties(ignoreUnknown = true)
public class MessagePublic extends Message {
	@JsonProperty("sender")
	private User sender;

	public MessagePublic(@JsonProperty("room") String room, @JsonProperty("sender") User sender, @JsonProperty("text") String text) {
		super(room, text);

		this.sender = sender;
	}

	@Override
	public String getRoom() {
		return this.room;
	}

	public User getSender() {
		return this.sender;
	}

	@Override
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