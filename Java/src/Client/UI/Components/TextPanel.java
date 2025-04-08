package Client.UI.Components;

import java.awt.BorderLayout;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.util.LinkedHashMap;

import javax.swing.JPanel;
import javax.swing.JScrollBar;
import javax.swing.JScrollPane;

@SuppressWarnings("serial")
public class TextPanel extends JPanel {
	private JPanel elements							= new JPanel(new GridBagLayout());
	private JScrollPane scrollbar					= new JScrollPane(this.elements);
	private final JPanel spacer						= new JPanel();
	private LinkedHashMap<String, Entry> entries	= new LinkedHashMap<String, Entry>();
	
	public enum Type {
        PUBLIC,
        ACTION,
        PRIVATE
    }
	
	public TextPanel() {
		this.setLayout(new BorderLayout());
		this.add(this.scrollbar, BorderLayout.CENTER);
	}
	
	private GridBagConstraints createGrid(boolean last) {
		GridBagConstraints gbc	= new GridBagConstraints();
        gbc.gridwidth			= GridBagConstraints.REMAINDER;
        gbc.weightx				= 1;
        
        if(last) {
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
	
	public void update() {
        this.validate();
        this.repaint();
	}
	
	public void addMessage(Type type, String text) {
		String style		= "";
		JScrollBar scroller	= this.scrollbar.getVerticalScrollBar();
		int max				= scroller.getMaximum();
	    int current			= scroller.getValue();
	    int visible			= scroller.getVisibleAmount();
		
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
}
