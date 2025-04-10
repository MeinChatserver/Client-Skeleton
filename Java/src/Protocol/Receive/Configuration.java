/**
 * Mein Chatserver
 * ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
 * Licensed Materials - Property of mein-chatserver.de.
 * © Copyright 2024. All Rights Reserved.
 *
 * @version 1.0.0
 * @author Adrian Preuß
 */

package Protocol.Receive;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import Interfaces.IPacket;
import Protocol.LoginStyle;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class Configuration implements IPacket {
	@JsonProperty("id")
	private String ID;

	@JsonProperty("suggestion")
	private String Suggestion;

	@JsonProperty("style")
	private LoginStyle Style;

	public Configuration(@JsonProperty("id") String id, @JsonProperty("suggestion") String suggestion, @JsonProperty("style") LoginStyle style) {
		this.ID = id;
		this.Suggestion = suggestion;
		this.Style = style;
	}

	public String getID() {
		return this.ID;
	}

	public String getSuggestion() {
		return this.Suggestion;
	}

	public LoginStyle getStyle() {
		return this.Style;
	}

	@Override
	@JsonIgnore
	public String getOperation() {
		return "CONFIGURATION";
	}
}