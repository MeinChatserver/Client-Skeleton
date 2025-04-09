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

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Style {
	@JsonProperty("output")
	private RoomOutput output;

	@JsonProperty("background")
	private RoomBackground background;

	@JsonProperty("ranks")
	@JsonFormat(shape = JsonFormat.Shape.STRING)
	private Map<String, Color> ranks;

	public Style() {
	}

	public Style(Object output, RoomBackground background, Map<String, Color> ranks) {

	}

	public RoomOutput getOutput() {
		return this.output;
	}

	public Map<String, Color> getRanks() {
		return ranks;
	}

	public void setRanks(Map<String, Color> ranks) {
		this.ranks = ranks;
	}

	@Override
	public String toString() {
		return "[Style]";
	}

	public java.awt.Color getBackgroundColor() {
		return this.background.getColor();
	}
}