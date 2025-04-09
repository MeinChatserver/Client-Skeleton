/**
 * Mein Chatserver
 * ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
 * Licensed Materials - Property of mein-chatserver.de.
 * © Copyright 2024. All Rights Reserved.
 *
 * @version 1.0.0
 * @author Adrian Preuß
 */

package Protocol.Helper;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import Protocol.IPacket;
import java.io.IOException;

public class IntegerSerializer extends JsonSerializer<IPacket> {
	@Override
	public void serialize(IPacket value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
		if(value != null) {
			gen.writeNumber(Integer.parseInt(value.toString()));
		} else {
			gen.writeNull();
		}
	}
}