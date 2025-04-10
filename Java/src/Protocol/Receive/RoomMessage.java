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

import Interfaces.IPacket;

public class RoomMessage implements IPacket {
	@JsonProperty("room")
	private String room;

	@JsonProperty("text")
	private String text;

	public RoomMessage(String room, String text) {
		this.room = room;
		this.text = text;
	}

	@Override
	public String toString() {
		return "[RoomMessage Room=" + room + ", Text=" + text + " ]";
	}

	@Override
	public String getOperation() {
		return "ROOM_MESSAGE";
	}
}