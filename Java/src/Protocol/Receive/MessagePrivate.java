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
public class MessagePrivate extends Message {
	@JsonProperty("sender")
	private User sender;

	@JsonProperty("users")
	private String[] users;

	public MessagePrivate(@JsonProperty("room") String room, @JsonProperty("sender") User sender, @JsonProperty("users") String[] users, @JsonProperty("text") String text) {
		super(room, text);

		this.sender = sender;
		this.users = users;
	}

	@Override
	public String getRoom() {
		return this.room;
	}

	public User getSender() {
		return this.sender;
	}

	public String[] getUsers() {
		return this.users;
	}

	@Override
	public String getText() {
		return this.text;
	}

	@Override
	public String toString() {
		return "[Message Type=PRIVATE Room=" + room + ", Sender=" + sender + ", Users=" + users + ", Text=" + text + " ]";
	}

	@Override
	public String getOperation() {
		return "MESSAGE_PRIVATE";
	}
}