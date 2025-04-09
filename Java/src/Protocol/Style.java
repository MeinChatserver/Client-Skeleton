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

import java.awt.Color;
import java.util.Map;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Style {
	@JsonProperty("output")
	private Object output;

	@JsonProperty("background")
	private RoomBackground background;

	@JsonProperty("ranks")
	private Map<Object, Object> ranks;

	public Style() {
	}

	public Style(Object output, RoomBackground background, Map<Object, Object> ranks) {

	}

	public Map<Object, Object> getRanks() {
		return ranks;
	}

	public void setRanks(Map<Object, Object> ranks) {
		this.ranks = ranks;
	}

	@Override
	public String toString() {
		return "[Style]";
	}

	public Color getBackgroundColor() {
		return this.background.getColor();
	}
}