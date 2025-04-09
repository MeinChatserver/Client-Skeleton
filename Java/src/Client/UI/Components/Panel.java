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

import javax.swing.JPanel;
import javax.swing.JScrollPane;

public class Panel extends JPanel {
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
		this.validate();
		this.repaint();
	}

	@Override
	protected void paintComponent(Graphics g) {
		super.paintComponent(g);
		// g.clearRect(0, 0, this.getWidth(), this.getHeight());

		/* Background Color */
		if(this.background_color != null) {
			g.setColor(this.background_color);
			g.fillRect(0, 0, this.getWidth(), this.getHeight());
		}
	}

	@Override
	public void setBackground(Color color) {
		this.background_color = color;
		this.setbackgrounds(this, color);
		this.update();
	}

	public void setBackground(Color color, Object image) {
		this.background_color = color;

		this.setbackgrounds(this, color);
		this.update();
	}

	public void setbackgrounds(Component component, Color color) {
		if(component instanceof Container) {
			for(Component child : ((Container) component).getComponents()) {
				if(child instanceof Panel) {
					child.setBackground(color);
				} else if(child instanceof JScrollPane) {
					child.setBackground(color);
				}

				this.setbackgrounds(child, color);
			}
		}
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
