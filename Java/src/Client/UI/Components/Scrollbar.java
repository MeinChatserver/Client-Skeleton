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
import java.awt.Rectangle;

import javax.swing.JComponent;
import javax.swing.JScrollBar;
import javax.swing.plaf.basic.BasicScrollBarUI;

public class Scrollbar extends JScrollBar {
	private Scroller scroller = new Scroller();

	public Scrollbar(final int orientation) {
		super(orientation);
		this.setUI(this.scroller);
		this.updateUI();
	}

	@Override
	public void setBackground(Color color) {
		super.setBackground(color);

		if(this.scroller != null) {
			this.scroller.setTrackColor(color);
		}

		this.repaint();
	}

	class Scroller extends BasicScrollBarUI {
		public void setTrackColor(Color color) {
			this.trackColor = color;

			if(this.scrollbar != null) {
				this.scrollbar.repaint();
			}
		}

		@Override
		protected void paintTrack(Graphics g, JComponent c, Rectangle trackBounds) {
			g.setColor(trackColor);
			g.fillRect(trackBounds.x, trackBounds.y, trackBounds.width, trackBounds.height);
		}
	}
}