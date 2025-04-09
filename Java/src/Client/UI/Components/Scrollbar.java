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

import javax.swing.JScrollBar;
import javax.swing.plaf.basic.BasicScrollBarUI;

public class Scrollbar extends JScrollBar {
	private Color background = null;

	public Scrollbar(final int orientation) {
		super(orientation);

		this.setUI(new BasicScrollBarUI() {
			@Override
			protected void configureScrollBarColors() {
				super.configureScrollBarColors();

				this.trackColor = background;
			}
		});
	}

	@Override
	public void setBackground(Color color) {
		super.setBackground(color);

		this.background = color;
	}
}