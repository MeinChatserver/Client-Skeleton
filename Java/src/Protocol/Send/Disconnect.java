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

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;

import Interfaces.IPacket;

@JsonAutoDetect(fieldVisibility = Visibility.ANY)
public class Disconnect implements IPacket {
	public Disconnect() {
		/* Do Nothing */
	}

	@Override
	public String toString() {
		return "[Disconnect]";
	}

	@Override
	public String getOperation() {
		return "DISCONNECT";
	}
}