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

import javax.swing.JScrollPane;
import javax.swing.ScrollPaneConstants;

import Client.ICallback;

public class List extends Panel {
	private Panel elements = new Panel(new GridBagLayout());
	private final Panel spacer = new Panel();
	private LinkedHashMap<String, Entry> entries = new LinkedHashMap<>();
	private JScrollPane scrollbar = new JScrollPane();
	private ICallback onSelect;

	public List() {
		this.setLayout(new BorderLayout());
		this.scrollbar.setViewportView(this.elements);
		this.scrollbar.setVerticalScrollBarPolicy(ScrollPaneConstants.VERTICAL_SCROLLBAR_ALWAYS);
		this.scrollbar.setHorizontalScrollBar(new Scrollbar(Adjustable.HORIZONTAL));
		this.scrollbar.setVerticalScrollBar(new Scrollbar(Adjustable.VERTICAL));
		this.add(this.scrollbar, BorderLayout.CENTER);
		this.update();
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
		panel.onClick(this.onSelect);
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

	public void onSelect(ICallback callback) {
		this.onSelect = callback;
	}

	@Override
	public void setBackground(Color color) {
		super.setBackground(color);

		this.update();
	}
}
