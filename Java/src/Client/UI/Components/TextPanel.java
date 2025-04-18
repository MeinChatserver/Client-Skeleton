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

import java.awt.Adjustable;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.util.LinkedHashMap;

import javax.swing.JScrollBar;
import javax.swing.JScrollPane;
import javax.swing.ScrollPaneConstants;

import Client.UI.Style;
import Client.UI.Style.StyleObserver;
import Protocol.BackgroundImage;
import Protocol.RoomOutput;

public class TextPanel extends Panel implements StyleObserver {
	private Panel elements = new Panel(new GridBagLayout());
	private JScrollPane scrollbar = new JScrollPane();
	private final Panel spacer = new Panel();
	private LinkedHashMap<String, Entry> entries = new LinkedHashMap<>();

	public enum Type {
		PUBLIC,
			ACTION,
			PRIVATE
	}

	public TextPanel() {
		super();
		this.setLayout(new BorderLayout());
		this.add(this.scrollbar, BorderLayout.CENTER);

		this.scrollbar.setViewportView(this.elements);
		this.scrollbar.setOpaque(false);
		this.scrollbar.getViewport().setOpaque(false);
		this.scrollbar.setVerticalScrollBarPolicy(ScrollPaneConstants.VERTICAL_SCROLLBAR_ALWAYS);
		this.scrollbar.setHorizontalScrollBar(new Scrollbar(Adjustable.HORIZONTAL));
		this.scrollbar.setVerticalScrollBar(new Scrollbar(Adjustable.VERTICAL));
	}

	private GridBagConstraints createGrid(boolean last) {
		GridBagConstraints gbc = new GridBagConstraints();
		gbc.gridwidth = GridBagConstraints.REMAINDER;
		gbc.weightx = 1;

		if(last) {
			gbc.weighty = 1;
		} else {
			gbc.fill = GridBagConstraints.HORIZONTAL;
		}

		return gbc;
	}

	public void clearEntrys() {
		this.entries.clear();
		this.elements.removeAll();
		this.update();
	}

	public void addEntry(String name, String text) {
		if(name == null || name.trim().isEmpty()) {
			return;
		}

		Entry panel = new Entry(name, text);
		panel.hover(false);
		this.entries.put(name, panel);
		this.elements.remove(this.spacer);
		this.elements.add(panel, this.createGrid(false));
		this.elements.add(this.spacer, this.createGrid(true));
		this.update();
	}

	public void removeEntry(String name) {
		if(this.entries.containsKey(name)) {
			Entry panel = this.entries.get(name);
			this.elements.remove(panel);
			this.entries.remove(name);
			this.update();
		}
	}

	@Override
	public void update() {
		this.revalidate();
		this.repaint();
	}

	public void addMessage(Type type, String text) {
		String style = "";
		JScrollBar scroller = this.scrollbar.getVerticalScrollBar();
		int max = scroller.getMaximum();
		int current = scroller.getValue();
		int visible = scroller.getVisibleAmount();

		switch(type) {
			case PUBLIC:
			case PRIVATE:
				style += "color: #000000;";
			break;
			case ACTION:
				style += "color: #0000FF;";
			break;
		}

		this.addEntry("message_" + this.entries.size(), "<html><div style=\"" + style + "\">" + text + "</div></html>");

		/* Scrolling */
		if(current + visible >= max - 10) {
			scroller.setValue(max);
		}
	}

	public void setBackground(Color color, BackgroundImage image) {
		super.setBackground(color);

		this.background_image = image;

		if(this.scrollbar != null) {
			this.scrollbar.setBackground(color);
		}
	}

	@Override
	public void setBackground(Color color) {
		super.setBackground(color);

		if(this.scrollbar != null) {
			this.scrollbar.setBackground(color);
		}
	}

	public void setColors(RoomOutput output) {
		// TODO Auto-generated method stub
	}

	@Override
	public void update(Style style) {
		// TODO Auto-generated method stub
	}
}
