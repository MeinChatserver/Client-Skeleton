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

import java.awt.Color;
import java.awt.Font;
import java.awt.event.FocusAdapter;
import java.awt.event.FocusEvent;

import javax.swing.JTextField;
import javax.swing.border.EmptyBorder;

public class Input extends JTextField {
	private String placeholder = null;

	public Input() {
		super();

		this.setFont(new Font("Arial", Font.PLAIN, 14));
		this.setBorder(new EmptyBorder(10, 10, 10, 10));
		this.addFocusListener(new FocusAdapter() {
			@Override
			public void focusGained(FocusEvent e) {
				if(placeholder != null && getText().equals(placeholder)) {
					setText("");
					setForeground(Color.BLACK);
				}
			}

			@Override
			public void focusLost(FocusEvent e) {
				if(placeholder != null && getText().isEmpty()) {
					setText(placeholder);
					setForeground(Color.GRAY);
				}
			}
		});
	}

	public void setPlaceholder(String text) {
		this.placeholder = text;
	}

	public void setDisabled(boolean state, String text) {
		this.setPlaceholder(text);
		this.setFocusable(!state);
		this.setEnabled(!state);
		this.requestFocus();
	}
}
