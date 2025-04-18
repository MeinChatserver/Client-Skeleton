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
import java.awt.Component;
import java.awt.Container;
import java.awt.Graphics;
import java.awt.LayoutManager2;
import java.awt.image.BufferedImage;

import javax.swing.JPanel;

import Protocol.BackgroundImage;

public class Panel extends JPanel {
	protected BackgroundImage background_image = null;
	private Color background_color = new Color(0, 0, 0, 0);

	public Panel() {
		super();
		this.init();
	}

	public Panel(LayoutManager2 layout) {
		super(layout);
		this.init();
	}

	protected void init() {
		this.setBackground(this.background_color);
		this.setOpaque(false);
		this.update();
	}

	public void update() {
		this.revalidate();
		this.repaint();
	}

	@Override
	protected void paintComponent(Graphics g) {
		super.paintComponent(g);

		/* Background Color */
		if(this.background_color != null) {
			g.setColor(this.background_color);
			g.fillRect(0, 0, this.getWidth(), this.getHeight());
		}

		/* Background Image */
		if(this.background_image != null) {
			BufferedImage image = this.background_image.getImage();

			if(image != null) {
				int width = image.getWidth();
				int height = image.getHeight();
				int x = (this.getWidth() - width) / 2;
				int y = (this.getHeight() - height) / 2;

				g.drawImage(image, x, y, width, height, this);
			}
		}
	}

	@Override
	public void setBackground(Color color) {
		this.background_color = color;
		this.update();
	}

	public void setBackground(Color color, BackgroundImage image) {
		this.background_color = color;
		this.background_image = image;

		this.update();
	}

	@Override
	public void setForeground(Color color) {
		super.setForeground(color);
		this.setForegrounds(this, color);
	}

	public void setForegrounds(Component component, Color color) {
		if(component instanceof Container) {
			for(Component child : ((Container) component).getComponents()) {
				if(child instanceof Label) {
					child.setForeground(color);
				}

				this.setForegrounds(child, color);
			}
		}
	}
}
