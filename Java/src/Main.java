/**
 * Mein Chatserver
 * ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
 * Licensed Materials - Property of mein-chatserver.de.
 * © Copyright 2024. All Rights Reserved.
 *
 * @version 1.0.0
 * @author Adrian Preuß
 */

import java.io.InputStream;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.attribute.BasicFileAttributes;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;
import java.util.Locale;
import java.util.jar.Attributes;
import java.util.jar.Manifest;
import java.util.stream.Stream;

import javax.swing.UIManager;

import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.CommandLineParser;
import org.apache.commons.cli.DefaultParser;
import org.apache.commons.cli.HelpFormatter;
import org.apache.commons.cli.Options;
import org.apache.commons.cli.ParseException;

import com.fasterxml.jackson.databind.ObjectMapper;

import Client.Client;
import Client.Utils;
import Client.UI.Bootstrap;
import jiconfont.swing.IconFontSwing;

@SuppressWarnings("unused")
public class Main {
	public static void main(String[] args) {
		/* Set Look & Feel */
		try {
			UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
		} catch(Exception e) {
			/* Do Nothing */
		}

		/* Register Icons */
		IconFontSwing.register(Bootstrap.getIconFont());

		Client client = new Client();
		Options options = new Options();
		CommandLineParser parser = new DefaultParser();

		/* Default Values */
		client.setHostname("demo.mein-chatserver.de");
		client.setPort(2710);

		/* Find Arguments on packed JAR */
		try {
			if(Main.class.getProtectionDomain().getCodeSource().getLocation().toString().endsWith(".jar")) {
				InputStream file = Main.class.getClassLoader().getResourceAsStream("META-INF/MANIFEST.MF");

				if(file != null) {
					Attributes attributes = new Manifest(file).getMainAttributes();
					if(attributes.containsKey(new Attributes.Name("Arguments"))) {
						String arguments = attributes.getValue("Arguments").trim();

						if(!arguments.isEmpty()) {
							if(arguments.contains(" ")) {
								args = Stream.concat(Arrays.stream(arguments.split(" ")), Arrays.stream(args)).toArray(String[]::new);
							} else {
								args = Stream.concat(Arrays.stream(new String[] { arguments }), Arrays.stream(args)).toArray(String[]::new);
							}
						}
					}
				}
			}
		} catch(Exception e) {
			e.printStackTrace();
		}

		/* Create CLI Arguments */
		options.addOption("h", "help", false, "Zeigt diese Hilfe an.");
		options.addOption("v", "version", false, "Zeigt die Version des Clienten an.");
		options.addOption("d", "hostname", true, "Hostname, Domain oder IP-Adresse zu dem verbunden werden soll.");
		options.addOption("p", "port", true, "Port des Servers zu dem verbunden werden soll.");
		options.addOption("s", "settings", true, "Deaktiviert die Einstellungen um nachträglich den Server zu ändern (0/1, true/false oder on/off).");

		try {
			CommandLine cmd = parser.parse(options, args);

			if(cmd.hasOption("version")) {
				try {
					URI file;

					if(Main.class.getProtectionDomain().getCodeSource().getLocation().toString().endsWith(".jar")) {
						file = Main.class.getProtectionDomain().getCodeSource().getLocation().toURI();
					} else {
						file = Main.class.getResource("/Client/Client.class").toURI();
					}

					System.out.println(new ObjectMapper().writerWithDefaultPrettyPrinter().writeValueAsString(new Object() {
						public String Client = client.getName();
						public String Version = client.getVersion();
						public String Build = new SimpleDateFormat("dd.MM.yyyy HH:mm:ss", Locale.GERMANY).format(new Date(Files.readAttributes(Paths.get(file), BasicFileAttributes.class).lastModifiedTime().toMillis()));
					}));
				} catch(Exception e) {
					e.printStackTrace();
				}
				return;
			}

			if(cmd.hasOption("help")) {
				HelpFormatter formatter = new HelpFormatter();
				formatter.printHelp("Client.jar [Options]", options);
				return;
			}

			if(cmd.hasOption("host")) {
				client.setHostname(cmd.getOptionValue("host"));
			}

			if(cmd.hasOption("port")) {
				client.setPort(Integer.parseInt(cmd.getOptionValue("port")));
			}

			if(cmd.hasOption("settings")) {
				String value = cmd.getOptionValue("settings");

				if(!Utils.isBoolean(value)) {
					System.out.println("Fehler: --settings darf nur ein boolischer Wert sein (0/1, true/false oder on/off)!");
					return;
				}

				client.setSettings(Utils.getBoolean(value));
			}
		} catch(ParseException e) {
			System.out.println("[Error] " + e.getMessage());
		}

		/* Start the Client */
		client.start();
	}
}
