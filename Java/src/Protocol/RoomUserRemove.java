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

public class RoomUserRemove extends RoomUserAdd {
	public RoomUserRemove(@JsonProperty("room") String room, @JsonProperty("user") User user) {
		super(room, user);
	}

	@Override
	public String toString() {
		return "[Remove User Room=" + this.getRoom() + ", User=" + this.getUser() + " ]";
	}

	@Override
	public String getOperation() {
		return "ROOM_USER_REMOVE";
	}
}