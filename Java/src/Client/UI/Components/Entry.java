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
import java.awt.FlowLayout;
import java.awt.Graphics;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;

import Client.ICallback;

public class Entry extends Panel {
	private boolean hover = true;
	private boolean hovering = false;
	private boolean clicking = false;
	private String name = null;
	private String text = null;
	private ICallback callback = null;
	private Label label = null;

	public Entry(String name, String text) {
		this.name = name;
		this.text = text;
		this.label = new Label(this.text);

		this.add(this.label);
		this.setLayout(new FlowLayout(FlowLayout.LEFT));
		this.addMouseListener(new MouseAdapter() {
			@Override
			public void mouseClicked(MouseEvent e) {
				if(callback != null) {
					callback.execute(name);
				}
			}

			@Override
			public void mouseEntered(MouseEvent e) {
				if(hover) {
					hovering = true;
					setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
					update();
				}
			}

			@Override
			public void mouseExited(MouseEvent e) {
				if(hover) {
					hovering = false;
					label.setForeground(null);
					update();
				}
			}

			@Override
			public void mousePressed(MouseEvent e) {
				if(hover) {
					clicking = true;
					label.setForeground(Color.white);
					update();
				}
			}

			@Override
			public void mouseReleased(MouseEvent e) {
				if(hover) {
					clicking = false;
					label.setForeground(null);
					update();
				}
			}
		});
	}

	@Override
	protected void paintComponent(Graphics g) {
		super.paintComponent(g);

		// g.clearRect(0, 0, this.getWidth(), this.getHeight());

		if(hovering) {
			if(clicking) {
				g.setColor(new Color(0, 0, 128, 204));
			} else {
				g.setColor(new Color(255, 255, 255, 77));
			}

			g.fillRect(0, 0, this.getWidth(), this.getHeight());
		}
	}

	public String getName() {
		return this.name;
	}

	public void onClick(ICallback callback) {
		this.callback = callback;
	}

	public void hover(boolean hover) {
		this.hover = hover;
	}
}
