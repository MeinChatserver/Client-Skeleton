/**
 * Mein Chatserver
 * ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
 * Licensed Materials - Property of mein-chatserver.de.
 * © Copyright 2024. All Rights Reserved.
 *
 * @version 1.0.0
 * @author Adrian Preuß
 */

package Protocol.Send;

import com.fasterxml.jackson.annotation.JsonProperty;

import Protocol.IPacket;

public class Login implements IPacket {
	@JsonProperty("username")
	private String username;

	@JsonProperty("password")
	private String password;

	@JsonProperty("chatroom")
	private String chatroom;

	public Login(String username, char[] password, String chatroom) {
		this.username = username;
		this.password = new String(password);
		this.chatroom = chatroom;
	}

	@Override
	public String toString() {
		return "[Login Username=" + username + ", Chatroom=" + chatroom + " ]";
	}

	@Override
	public String getOperation() {
		return "LOGIN";
	}
}