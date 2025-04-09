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

import java.awt.Color;
import java.awt.Graphics;

import javax.swing.JLabel;

public class Label extends JLabel {
	public Label() {
		super();
		this.init();
	}

	public Label(String text) {
		super(text);
		this.init();
	}

	protected void init() {
		this.setOpaque(false);
		this.setBackground(new Color(0, 0, 0, 0));
	}

	@Override
	protected void paintComponent(Graphics g) {
		super.paintComponent(g);
	}
}
