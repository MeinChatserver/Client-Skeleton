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

import Interfaces.IPacket;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Category implements IPacket {
	@JsonProperty("id")
	private int ID;

	@JsonProperty("name")
	private String Name;

	public Category() {
	}

	public Category(int id, String name) {
		this.ID = id;
		this.Name = name;
	}

	public int getID() {
		return ID;
	}

	public void setID(int id) {
		this.ID = id;
	}

	public String getName() {
		return this.Name;
	}

	public void setName(String name) {
		this.Name = name;
	}

	@Override
	public String toString() {
		return "[Category ID=" + this.ID + ", Name=\"" + this.Name + "\" ]";
	}

	@Override
	public String getOperation() {
		return "ROOMS_CATEGORIES";
	}
}