/**
 * Mein Chatserver
 * ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
 * Licensed Materials - Property of mein-chatserver.de.
 * © Copyright 2024. All Rights Reserved.
 *
 * @version 1.0.0
 * @author  Adrian Preuß
 */

package Client.UI.Components;

import java.awt.BorderLayout;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.util.LinkedHashMap;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import Client.ICallback;

@SuppressWarnings("serial")
public class List extends JPanel {
	private JPanel elements							= new JPanel(new GridBagLayout());
	private LinkedHashMap<String, Entry> entries	= new LinkedHashMap<String, Entry>();
	private ICallback onSelect;
	
	public List() {
		this.elements.add(new JPanel(), this.createGrid(true));
		this.setLayout(new BorderLayout());
		this.add(new JScrollPane(this.elements), BorderLayout.CENTER);
	}

	private GridBagConstraints createGrid(boolean first) {
		GridBagConstraints gbc	= new GridBagConstraints();
        gbc.gridwidth			= GridBagConstraints.REMAINDER;
        gbc.weightx				= 1;
        
        if(first) {
        	gbc.weighty			= 1;
        } else {
            gbc.fill			= GridBagConstraints.HORIZONTAL;
        }
        
        return gbc;
	}
	
	public void clearEntrys() {
		this.entries.clear();
		this.elements.removeAll();
		this.update();
	}
	
	public void addEntry(String name) {
		Entry panel = new Entry(name);
		panel.onClick(this.onSelect);
		this.entries.put(name, panel);       
        this.elements.add(panel, this.createGrid(false), 0);
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
	
	public void update() {
        this.validate();
        this.repaint();
	}
	
	public void onSelect(ICallback callback) {
        this.onSelect = callback;
    }
}
