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

import java.awt.Color;
import java.awt.Cursor;
import java.awt.FlowLayout;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import javax.swing.JLabel;
import javax.swing.JPanel;
import Client.ICallback;

@SuppressWarnings("serial")
public class Entry extends JPanel {
	private boolean hover		= true;
	private String name			= null;
	private String text			= null;
	private ICallback callback	= null;
	
	public Entry(String name, String text) {
		this.name = name;
		this.text = text;
		
		this.setLayout(new FlowLayout(FlowLayout.LEFT));
		this.add(new JLabel(this.text));
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
                	setBackground(Color.CYAN);
            		setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
                }
            }
			
			@Override
            public void mouseExited(MouseEvent e) {
                if(hover) {
                	setBackground(null);
                }
            }
			
			@Override
            public void mousePressed(MouseEvent e) {
				if(hover) {
					setBackground(Color.GREEN);
				}
            }

            @Override
            public void mouseReleased(MouseEvent e) {
            	if(hover) {
            		setBackground(null);
            	}
            }
        });
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
