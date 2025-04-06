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

public class Handshake implements IPacket {
    @JsonProperty("client")
    public String Client;

    @JsonProperty("version")
    public String Version;

    @JsonProperty("location")
    public String Location;

    @JsonProperty("useragent")
    public String UserAgent;

    public Handshake(String client, String version) {
        this.Client     = client;
        this.Version    = version;
        this.Location   = "-";
        this.UserAgent  = "Java/" + System.getProperty("java.version");
    }
    
    @JsonIgnore
    public String getOperation() {
    	return "HANDSHAKE";
    }
}