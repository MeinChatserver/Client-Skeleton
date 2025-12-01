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

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import Interfaces.IPacket;

@JsonIgnoreProperties(ignoreUnknown = true)
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
		this.Client = client;
		this.Version = version;
		this.Location = System.getProperty("os.name") + "/" + System.getProperty("os.version") + " (" + System.getProperty("os.arch") + ")";
		this.UserAgent = System.getProperty("java.runtime.name") + "/" + System.getProperty("java.version") + " (" + System.getProperty("sun.arch.data.model") + "bit)";
	}

	@Override
	@JsonIgnore
	public String getOperation() {
		return "HANDSHAKE";
	}
}