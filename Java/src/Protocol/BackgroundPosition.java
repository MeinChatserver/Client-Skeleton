package Protocol;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonValue;

@JsonIgnoreProperties(ignoreUnknown = true)
public enum BackgroundPosition {
	STRETCHED("STRETCHED"), // Strecken
		SCALED_FILL_CENTER_1("SCALED_FILL_CENTER_1"), // Skaliert (Füllend, Zentriert, Modus 1)
		SCALED_FILL_CENTER_2("SCALED_FILL_CENTER_2"), // Skaliert (Füllend, Zentriert, Modus 2)
		SCALED_FILL_CENTER_3("SCALED_FILL_CENTER_3"), // Skaliert (Füllend, Zentriert, Modus 3)
		SCALED_HEIGHT_RIGHT("SCALED_HEIGHT_RIGHT"), // Skaliert auf Höhe (Rechts)
		SCALED_WIDTH_TOP("SCALED_WIDTH_TOP"), // Skaliert auf Breite (Oben)
		SCALED_WIDTH_BOTTOM("SCALED_WIDTH_BOTTOM"), // Skaliert auf Breite (Unten)
		TILED("TILED"), // Gekachelt
		TILED_ZOOM_2("TILED_ZOOM_2"), // Gekachelt (2fache Größe)
		TILED_ZOOM_3("TILED_ZOOM_3"), // Gekachelt (3fache Größe)
		TILED_ROWS_OFFSET("TILED_ROWS_OFFSET"), // Gekachelt (Zeilenweise versetzt)
		TILED_ROWS_ZOOM_2("TILED_ROWS_ZOOM_2"), // Gekachelt (Zeilenweise, 2fache Größe)
		TILED_ROWS_ZOOM_3("TILED_ROWS_ZOOM_3"), // Gekachelt (Zeilenweise, 3fache Größe)
		TILED_COLUMS("TILED_COLUMS"), // Gekachelt (Spaltenweise)
		TILED_COLUMS_ZOOM_2("TILED_COLUMS_ZOOM_2"), // Gekachelt (Spaltenweise, 2fache Größe)
		TILED_COLUMS_ZOOM_3("TILED_COLUMS_ZOOM_3"), // Gekachelt (Spaltenweise, 3fache Größe)
		CENTERED("CENTERED"), // Zentriert
		CENTERED_2("CENTERED_2"), // Zentriert (2fache Größe)
		CENTERED_3("CENTERED_3"); // Zentriert (3fache Größe)

	private final String value;

	BackgroundPosition(String value) {
		this.value = value;
	}

	@JsonValue
	public String getValue() {
		return value;
	}

	@JsonCreator
	public static BackgroundPosition forValue(String value) {
		for(BackgroundPosition s : BackgroundPosition.values()) {
			if(s.getValue().equalsIgnoreCase(value)) {
				return s;
			}
		}

		throw new IllegalArgumentException("Unknown status: " + value);
	}
}
