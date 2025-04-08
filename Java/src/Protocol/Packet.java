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

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import Protocol.Helper.ObjectDeserializer;
import Protocol.Helper.ObjectSerializer;

public class Packet {
	@JsonProperty("operation")
	public String operation;
	
	@JsonProperty("data")
	@JsonSerialize(using = ObjectSerializer.class)
	@JsonDeserialize(using = ObjectDeserializer.class)
	public Object data;
	
	@JsonCreator
	public Packet(
		@JsonProperty("operation") String operation,
		@JsonProperty("data") Object data
	) {
		 this.operation	= operation;
		 this.data		= data;
	}
	
	public Packet() {}

    public String getOperation() {
        return this.operation;
    }

    public void setOperation(String operation) {
        this.operation = operation;
    }

    public Object getData() {
        return this.data;
    }

    public void setData(Object data) {
        this.data = data;
    }
	
    @Override
    public String toString() {
        try {
            return new ObjectMapper().writeValueAsString(this);
        } catch(Exception e) {
            e.printStackTrace();
            return "{}";
        }
    }
}