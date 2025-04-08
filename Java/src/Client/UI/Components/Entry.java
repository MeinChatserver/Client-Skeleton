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
	private String name			= null;
	private String text			= null;
	private ICallback callback	= null;
	
	public Entry(String name, String text) {
		this.name = name;
		this.text = text;
		
		this.setLayout(new FlowLayout(FlowLayout.LEFT));
		this.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
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
                setBackground(Color.CYAN);
            }
			
			@Override
            public void mouseExited(MouseEvent e) {
                setBackground(null);
            }
			
			@Override
            public void mousePressed(MouseEvent e) {
				setBackground(Color.GREEN);
            }

            @Override
            public void mouseReleased(MouseEvent e) {
            	setBackground(null);
            }
        });
	}
	
	public String getName() {
		return this.name;
	}
	
	public void onClick(ICallback callback) {
        this.callback = callback;
    }
}
