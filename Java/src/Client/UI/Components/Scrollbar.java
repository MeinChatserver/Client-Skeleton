package Client.UI.Components;

import java.awt.Color;

import javax.swing.JScrollBar;
import javax.swing.plaf.basic.BasicScrollBarUI;

@SuppressWarnings("serial")
public class Scrollbar extends JScrollBar {
	private Color background = null;
	
	public Scrollbar(final int orientation) {
		super(orientation);
		
		this.setUI(new BasicScrollBarUI() {
			@Override
			protected void configureScrollBarColors() {
				super.configureScrollBarColors();
				
				this.trackColor = background;
			}
		});
	}
	
	@Override
	public void setBackground(Color color) {
		super.setBackground(color);
		
		this.background = color;
	}
}