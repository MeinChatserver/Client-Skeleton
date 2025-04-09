/**
 * Mein Chatserver
 * ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
 * Licensed Materials - Property of mein-chatserver.de.
 * © Copyright 2024. All Rights Reserved.
 *
 * @version 1.0.0
 * @author Adrian Preuß
 */

package Client;

public class Utils {
	public static String escapeHTML(String input) {
		if(input == null) {
			return null;
		}

		return input.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;").replace("'", "&apos;");
	}

	public static boolean getBoolean(String value) {
		value = value.toLowerCase();

		return (value.equals("1") || value.equals("true") || value.equals("on"));
	}

	public static boolean isBoolean(String value) {
		value = value.toLowerCase();

		if(value.equals("1") || value.equals("true") || value.equals("on")) {
			return true;
		}

		if(value.equals("0") || value.equals("false") || value.equals("off")) {
			return true;
		}

		return false;
	}
}
