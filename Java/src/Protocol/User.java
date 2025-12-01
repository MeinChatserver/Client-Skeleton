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
public class User implements IPacket {
	@JsonProperty("id")
	public int ID;

	@JsonProperty("username")
	public String Username;

	@JsonProperty("rank")
	public int Rank;

	public User(@JsonProperty("id") int id, @JsonProperty("username") String username, @JsonProperty("rank") int rank) {
		this.ID = id;
		this.Username = username;
		this.Rank = rank;
	}

	public String getName() {
		return this.Username;
	}

	@Override
	@JsonIgnore
	public String getOperation() {
		return "USER";
	}
}