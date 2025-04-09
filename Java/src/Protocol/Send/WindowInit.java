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

import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import Protocol.IPacket;
import Protocol.Helper.StringSerializer;

@JsonSerialize(using = StringSerializer.class)
public class WindowInit implements IPacket {
	private String name = null;

	public WindowInit(String name) {
		this.name = name;
	}

	@Override
	public String toString() {
		return this.name;
	}

	@Override
	public String getOperation() {
		return "WINDOW_INIT";
	}
}