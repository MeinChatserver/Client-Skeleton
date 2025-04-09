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

public class RoomUserAdd implements IPacket {
	@JsonProperty("room")
	private String room;

	@JsonProperty("user")
	private User user;

	public RoomUserAdd(@JsonProperty("room") String room, @JsonProperty("user") User user) {
		this.room = room;
		this.user = user;
	}

	public String getRoom() {
		return this.room;
	}

	public User getUser() {
		return this.user;
	}

	@Override
	public String toString() {
		return "[Add User Room=" + room + ", User=" + user + " ]";
	}

	@Override
	public String getOperation() {
		return "ROOM_USER_ADD";
	}
}