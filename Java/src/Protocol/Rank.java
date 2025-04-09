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

public class Rank implements IPacket {
	@JsonProperty("id")
	public String ID;

	@JsonProperty("name")
	public String Name;

	@JsonProperty("color")
	public String Color;

	public Rank(@JsonProperty("id") String id, @JsonProperty("name") String name, @JsonProperty("color") String color) {
		this.ID = id;
		this.Name = name;
		this.Color = color;
	}

	@Override
	@JsonIgnore
	public String getOperation() {
		return "RANK";
	}
}