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

import javax.swing.*;
import java.awt.*;

@SuppressWarnings("serial")
public class Link extends JButton {
	public Link() {
		super();
		this.setContentAreaFilled(false);
		this.setBorderPainted(false); 
		this.setBorder(BorderFactory.createEmptyBorder());
		this.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
		this.setFocusPainted(false);
		this.setOpaque(false);
	}
	
	@Override
     protected void paintComponent(Graphics g) {
        super.paintComponent(g);

        Graphics2D g2 = (Graphics2D) g.create();

        if(this.getModel().isEnabled()) {
            g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            
        	FontMetrics metrics	= g2.getFontMetrics();
        	int width			= metrics.stringWidth(this.getText());
        	int height			= metrics.getHeight();
        	int left			= (this.getWidth() - width) / 2;
        	int top				= (this.getHeight() + height) / 2 - metrics.getDescent();

        	g2.setColor(Color.BLUE);
        	g2.drawString(this.getText(), left, top);
        	g2.drawLine(left, top + 1, left + width, top + 1);
        	
        	g2.dispose();
        }
    }
}
