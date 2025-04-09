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
import java.awt.event.ComponentEvent;
import java.awt.event.ComponentListener;
import java.util.LinkedHashMap;

import javax.swing.JScrollBar;
import javax.swing.JScrollPane;
import javax.swing.ScrollPaneConstants;

public class TextPanel extends Panel {
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
		this.scrollbar.setVerticalScrollBarPolicy(ScrollPaneConstants.VERTICAL_SCROLLBAR_ALWAYS);
		this.scrollbar.setHorizontalScrollBar(new Scrollbar(Adjustable.HORIZONTAL));
		this.scrollbar.setVerticalScrollBar(new Scrollbar(Adjustable.VERTICAL));

		this.scrollbar.addComponentListener(new ComponentListener() {
			@Override
			public void componentResized(ComponentEvent e) {
			}

			@Override
			public void componentMoved(ComponentEvent e) {
			}

			@Override
			public void componentShown(ComponentEvent e) {
				scrollbar.setBackground(getBackground());
			}

			@Override
			public void componentHidden(ComponentEvent e) {
			}
		});

		this.scrollbar.revalidate();
		this.scrollbar.repaint();
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
		this.validate();
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

			break;
			case ACTION:
				style += "color: #0000FF;";
			break;
			case PRIVATE:

			break;
		}

		this.addEntry("message_" + this.entries.size(), "<html><div style=\"" + style + "\">" + text + "</div></html>");

		/* Scrolling */
		if(current + visible >= max - 10) {
			scroller.setValue(max);
		}
	}

	@Override
	public void setBackground(Color color) {
		super.setBackground(color);

		if(this.scrollbar != null) {
			this.scrollbar.setBackground(color);
		}
	}
}
