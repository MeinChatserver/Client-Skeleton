/**
 * Mein Chatserver
 * ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
 * Licensed Materials - Property of mein-chatserver.de.
 * © Copyright 2024. All Rights Reserved.
 *
 * @version 1.0.0
 * @author Adrian Preuß
 */

package Client.UI;

import java.awt.BorderLayout;
import java.awt.Dimension;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

import javax.swing.JTextField;
import javax.swing.SwingConstants;
import javax.swing.border.EmptyBorder;

import Client.Client;
import Client.UI.Components.Button;
import Client.UI.Components.Dialog;
import Client.UI.Components.Label;
import Client.UI.Components.Panel;
import Client.UI.Components.Window;
import Protocol.LoginStyle;

public class Settings extends Window {
	private Panel panel = new Panel();
	private Panel buttons = new Panel();
	private Label label_hostname = new Label();
	private Label label_port = new Label();

	private JTextField input_hostname = new JTextField();
	private JTextField input_port = new JTextField();

	private Button button_cancel = new Button();
	private Button button_save = new Button();

	public Settings(Client client) {
		super(client);
		this.setTitle("Einstellungen");
		this.setSize(350, 200);
		this.setPreferredSize(new Dimension(350, 200));
		this.setMinimumSize(new Dimension(350, 200));
		this.add(this.panel);
		this.panel.setBorder(new EmptyBorder(10, 10, 10, 10));

		GridBagLayout form = new GridBagLayout();
		form.columnWidths = new int[] { 0, 0, 0, 0 };
		form.rowHeights = new int[] { 0, 0, 0, 0, 0 };
		form.columnWeights = new double[] { 0, 0, 1 };
		form.rowWeights = new double[] { 0, 0, 0, 0 };
		this.panel.setLayout(form);

		/* Form: Hostname */
		this.label_hostname.setText("Hostname:");
		this.label_hostname.setHorizontalAlignment(SwingConstants.RIGHT);
		this.input_hostname.setText(this.getClient().getHostname());
		this.panel.add(this.label_hostname, new GridBagConstraints(0, 0, 1, 1, 0.0, 0.0, GridBagConstraints.CENTER, GridBagConstraints.BOTH, new Insets(0, 0, 5, 5), 0, 0));
		this.panel.add(this.input_hostname, new GridBagConstraints(1, 0, 2, 1, 0.0, 0.0, GridBagConstraints.CENTER, GridBagConstraints.BOTH, new Insets(0, 0, 5, 0), 0, 0));

		/* Form: Port */
		this.label_port.setText("Port:");
		this.label_port.setHorizontalAlignment(SwingConstants.RIGHT);
		this.input_port.setText("" + this.getClient().getPort());
		this.panel.add(this.label_port, new GridBagConstraints(0, 1, 1, 1, 0.0, 0.0, GridBagConstraints.CENTER, GridBagConstraints.BOTH, new Insets(0, 0, 5, 5), 0, 0));
		this.panel.add(this.input_port, new GridBagConstraints(1, 1, 2, 1, 0.0, 0.0, GridBagConstraints.CENTER, GridBagConstraints.BOTH, new Insets(0, 0, 5, 0), 0, 0));

		this.buttons.setLayout(new BorderLayout());

		/* Form: Button "Cancel" */
		this.button_cancel.setText("Abbrechen");
		this.buttons.add(this.button_cancel, BorderLayout.WEST);
		this.button_cancel.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				input_hostname.setText(getClient().getHostname());
				input_port.setText("" + getClient().getPort());
				close();
			}
		});

		/* Form: Button "Save" */
		this.button_save.setText("Speichern");
		this.buttons.add(this.button_save, BorderLayout.EAST);
		this.button_save.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent event) {
				try {
					client.setServer(input_hostname.getText(), Integer.parseInt(input_port.getText()));
					close();
				} catch(Exception error) {
					new Dialog("Problem", "Die Eingaben sind ungültig!");
				}
			}
		});

		this.buttons.setBorder(new EmptyBorder(10, 0, 0, 0));
		this.panel.add(this.buttons, new GridBagConstraints(1, 3, 2, 1, 0.0, 0.0, GridBagConstraints.CENTER, GridBagConstraints.HORIZONTAL, new Insets(0, 0, 5, 0), 0, 0));
	}

	public void setStyle(LoginStyle style) {
		if(style == null) {
			this.panel.setBackground(null);
			this.panel.setForeground(null);
			return;
		}

		this.panel.setBackground(style.getBackground().getColor(), style.getBackgroundImage());
		this.panel.setForeground(style.getForeground().getColor());
	}

	public void update() {
		this.input_hostname.setText(this.getClient().getHostname());
		this.input_port.setText("" + this.getClient().getPort());
	}
}
