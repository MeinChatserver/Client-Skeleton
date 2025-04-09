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

public class Category implements IPacket {
	@JsonProperty("id")
	private int id;

	@JsonProperty("name")
	private String name;

	public Category() {
	}

	public Category(int id, String name) {
		this.id = id;
		this.name = name;
	}

	public int getID() {
		return id;
	}

	public void setID(int id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@Override
	public String toString() {
		return "[Category ID=" + id + ", Name=\"" + name + "\" ]";
	}

	@Override
	public String getOperation() {
		return "ROOMS_CATEGORIES";
	}
}