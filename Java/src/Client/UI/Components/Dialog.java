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

import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;

import javax.swing.JDialog;
import javax.swing.JOptionPane;

public class Dialog extends JDialog {
	public Dialog(String title, String text) {
		super();

		final JOptionPane optionPane = new JOptionPane(text, JOptionPane.QUESTION_MESSAGE, JOptionPane.CLOSED_OPTION);

		optionPane.addPropertyChangeListener(new PropertyChangeListener() {
			public void propertyChange(PropertyChangeEvent e) {
				if(isVisible() && (e.getSource() == optionPane) && (e.getPropertyName().equals(JOptionPane.VALUE_PROPERTY))) {
					dispose();
				}
			}
		});

		this.setDefaultCloseOperation(JDialog.DISPOSE_ON_CLOSE);
		this.setTitle(title);
		this.setContentPane(optionPane);
		this.pack();
		this.setVisible(true);
	}
}
