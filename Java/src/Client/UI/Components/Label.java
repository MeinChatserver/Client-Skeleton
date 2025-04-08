package Client.UI.Components;

import java.awt.Color;
import java.awt.Graphics;
import javax.swing.JLabel;

@SuppressWarnings("serial")
public class Label extends JLabel {
	public Label() {
		super();
		this.init();
	}
	
	public Label(String text) {
		super(text);
		this.init();
	}

	protected void init() {
		this.setOpaque(false);
	    this.setBackground(new Color(0, 0, 0, 0));		
	}
	
	@Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
    }
}
