/**
 * Mein Chatserver
 * ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
 * Licensed Materials - Property of mein-chatserver.de.
 * © Copyright 2024. All Rights Reserved.
 *
 * @version 1.0.0
 * @author Adrian Preuß
 */

package Client.UI.Components;

import java.awt.Dimension;

import javax.swing.JFrame;

import Client.Client;

public class Window extends JFrame {
	private Client client;

	public Window(Client client) {
		super();

		this.client = client;

		this.setSize(new Dimension(200, 200));
		this.setPreferredSize(new Dimension(200, 200));
		this.setMinimumSize(new Dimension(200, 200));
	}

	public Client getClient() {
		return this.client;
	}

	public void open() {
		this.setVisible(true);
	}

	public void close() {
		this.setVisible(false);
	}
}
