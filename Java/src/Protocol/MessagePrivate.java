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

public class MessagePrivate extends Message {
	@JsonProperty("sender")
	private String sender;

	@JsonProperty("users")
	private User[] users;

	public MessagePrivate(@JsonProperty("room") String room, @JsonProperty("sender") String sender, @JsonProperty("users") User[] users, @JsonProperty("text") String text) {
		super(room, text);

		this.sender = sender;
		this.users = users;
	}

	public String getRoom() {
		return this.room;
	}

	public String getSender() {
		return this.sender;
	}

	public User[] getUsers() {
		return this.users;
	}

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