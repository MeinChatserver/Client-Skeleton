/**
 * Mein Chatserver
 * ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
 * Licensed Materials - Property of mein-chatserver.de.
 * © Copyright 2024. All Rights Reserved.
 *
 * @version 1.0.0
 * @author  Adrian Preuß
 */

package Protocol;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import Protocol.Helper.StringSerializer;

@JsonSerialize(using = StringSerializer.class)
public class RoomUpdate extends Room {
	@Override
	public String getOperation() {
		return "ROOM_UPDATE";
	}
}