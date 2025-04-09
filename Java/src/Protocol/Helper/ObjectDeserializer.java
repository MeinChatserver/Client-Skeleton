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

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.io.IOException;

public class ObjectDeserializer extends JsonDeserializer<Object> {
	@Override
	public Object deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
		if(p.getCurrentToken() == com.fasterxml.jackson.core.JsonToken.START_ARRAY) {
			return p.readValueAs(ArrayNode.class);
		}

		if(p.getCurrentToken().isScalarValue()) {
			return p.getText();
		}

		return p.readValueAs(ObjectNode.class);
	}
}