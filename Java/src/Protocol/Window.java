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

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

public class Window implements IPacket {
	@JsonProperty("name")
	public String name;

	@JsonProperty("title")
	public String title;

	@JsonProperty("width")
	public int width;

	@JsonProperty("height")
	public int height;

	@JsonProperty("user")
	public User user;

	@JsonProperty("room")
	public Room room;

	@JsonProperty("ranks")
	public Rank[] ranks;

	public Window(@JsonProperty("name") String name, @JsonProperty("title") String title) {
		this.name = name;
		this.title = title;
	}

	public Room getRoom() {
		return this.room;
	}

	@JsonIgnore
	public String getOperation() {
		return "WINDOW_ROOM";
	}

	@Override
	public String toString() {
		return "[Window Name=" + this.name + ", Title=" + this.title + "]";
	}
}