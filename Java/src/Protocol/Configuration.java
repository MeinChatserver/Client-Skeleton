/**
 * Mein Chatserver
 * ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
 * Licensed Materials - Property of mein-chatserver.de.
 * © Copyright 2024. All Rights Reserved.
 *
 * @version 1.0.0
 * @author Adrian Preuß
 */

package Protocol;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class Configuration implements IPacket {
	@JsonProperty("id")
	public String ID;

	@JsonProperty("suggestion")
	public String Suggestion;

	@JsonProperty("style")
	public LoginStyle Style;

	public Configuration(@JsonProperty("id") String id, @JsonProperty("suggestion") String suggestion, @JsonProperty("style") LoginStyle style) {
		this.ID = id;
		this.Suggestion = suggestion;
		this.Style = style;
	}

	@JsonIgnore
	public String getOperation() {
		return "CONFIGURATION";
	}
}