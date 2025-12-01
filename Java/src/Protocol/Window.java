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
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import Interfaces.IPacket;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Window implements IPacket {
	@JsonProperty("name")
	public String name;

	@JsonProperty("title")
	public String title;

	@JsonProperty("reference")
	public String reference = null;

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

	public boolean hasReference() {
		if(this.reference == null) {
			return false;
		}

		return !this.reference.isEmpty();
	}

	public String getReference() {
		return this.reference;
	}

	@Override
	@JsonIgnore
	public String getOperation() {
		return "WINDOW_ROOM";
	}

	@Override
	public String toString() {
		return "[Window Name=" + this.name + ", Title=" + this.title + "]";
	}
}