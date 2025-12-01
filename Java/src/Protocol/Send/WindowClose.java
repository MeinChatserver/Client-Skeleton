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

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import Interfaces.IPacket;
import Protocol.Helper.StringSerializer;

@JsonSerialize(using = StringSerializer.class)
@JsonIgnoreProperties(ignoreUnknown = true)
public class WindowClose implements IPacket {
	private String name = null;

	public WindowClose(String name) {
		this.name = name;
	}

	@Override
	public String toString() {
		return this.name;
	}

	@Override
	public String getOperation() {
		return "WINDOW_CLOSE";
	}
}