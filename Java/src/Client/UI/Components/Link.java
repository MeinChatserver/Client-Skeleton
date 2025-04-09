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
import java.awt.Cursor;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;

import javax.swing.BorderFactory;
import javax.swing.Icon;
import javax.swing.JButton;

public class Link extends JButton {
	private Color color_default = Color.decode("#000099");
	private Color color_hover = Color.decode("#FAFAFA");
	private int font_style = Font.PLAIN;
	private int font_size = 12;
	private boolean hovering = false;
	private Icon icon_default = null;
	private Icon icon_hover = null;
	private Font font = new Font("Arial", this.font_style, this.font_size);

	public Link() {
		super();
		this.init();
	}

	public Link(Icon icon) {
		super(icon);

		this.icon_default = icon;

		this.init();
	}

	public Link(Icon icon, Icon hover) {
		super(icon);

		this.icon_default = icon;
		this.icon_hover = hover;

		this.init();
	}

	protected void init() {
		this.setFont(this.font);
		this.setForeground(this.color_default);
		this.setContentAreaFilled(false);
		this.setBorderPainted(false);
		this.setBorder(BorderFactory.createEmptyBorder());
		this.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
		this.setFocusPainted(false);
		this.setOpaque(false);

		this.addMouseListener(new MouseAdapter() {
			@Override
			public void mouseClicked(MouseEvent e) {
			}

			@Override
			public void mouseEntered(MouseEvent e) {
				hovering = true;
				setIcon(icon_hover);
				setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
				repaint();
			}

			@Override
			public void mouseExited(MouseEvent e) {
				hovering = false;
				setIcon(icon_default);
				repaint();
			}

			@Override
			public void mousePressed(MouseEvent e) {
			}

			@Override
			public void mouseReleased(MouseEvent e) {
			}
		});
	}

	@Override
	protected void paintComponent(Graphics g) {
		super.paintComponent(g);

		Graphics2D g2 = (Graphics2D) g.create();

		g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
		g2.setFont(this.font);

		FontMetrics metrics = g2.getFontMetrics();
		int width = metrics.stringWidth(this.getText());
		int height = metrics.getHeight();
		int left = (this.getWidth() - width) / 2;
		int top = (this.getHeight() + height) / 2 - metrics.getDescent();

		if(this.getModel().isEnabled()) {
			g2.setColor(this.hovering ? this.color_hover : this.color_default);
		} else {
			g2.setColor(Color.GRAY);
		}

		g2.drawString(this.getText(), left, top);
		g2.drawLine(left, top + 1, left + width, top + 1);

		g2.dispose();
	}

	public void setColors(Color defaults, Color hover) {
		this.color_default = defaults;
		this.color_hover = hover;
	}

	public void setFont(int style, int size) {
		this.font_style = style;
		this.font_size = size;
		this.font = new Font("Arial", this.font_style, this.font_size);
	}
}
