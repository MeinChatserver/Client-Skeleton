/**
 * Mein Chatserver
 * ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
 * Licensed Materials - Property of mein-chatserver.de.
 * © Copyright 2024. All Rights Reserved.
 *
 * @version 1.0.0
 * @author  Adrian Preuß
 */

package Protocol.Helper;

import java.io.IOException;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

public class ObjectSerializer extends JsonSerializer<Object> {    
	@Override
    public void serialize(Object value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
		System.out.println(value);
		
		if(value == null) {
        	gen.writeNull();
		} else if(value instanceof String) {
            gen.writeString((String) value);
        } else if(value instanceof ArrayNode) {
            gen.writeTree((ArrayNode) value);
        } else if(value instanceof ObjectNode) {
            gen.writeTree((ObjectNode) value);
        } else {
            gen.writeObject(value);
        }
    }
}