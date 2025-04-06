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

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

public class Configuration implements IPacket {
    @JsonProperty("id")
    public String ID;

    @JsonProperty("suggestion")
    public String Suggestion;
    
    public Configuration(
    		@JsonProperty("id") String id,
    		@JsonProperty("suggestion") String suggestion
	) {    	
        this.ID			= id;
        this.Suggestion	= suggestion;
    }
    
    @JsonIgnore
    public String getOperation() {
    	return "CONFIGURATION";
    }
}