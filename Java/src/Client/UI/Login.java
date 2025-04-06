/**
 * Mein Chatserver
 * ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
 * Licensed Materials - Property of mein-chatserver.de.
 * © Copyright 2024. All Rights Reserved.
 *
 * @version 1.0.0
 * @author  Adrian Preuß
 */

package Client.UI;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Dialog;
import java.awt.Dimension;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;
import java.awt.event.ActionEvent;

import javax.swing.JButton;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JPasswordField;
import javax.swing.JTextField;
import javax.swing.SwingConstants;
import javax.swing.border.EmptyBorder;
import Client.Client;
import Client.UI.Components.Link;
import Client.UI.Components.List;

@SuppressWarnings("serial")
public class Login extends JPanel {
	private Client client;
	
	private JPanel panel_top;
	private JPanel panel_middle;
	private JPanel panel_bottom;
	private JPanel panel_buttons;
	
	private JLabel label_username;
	private JLabel label_password;
	private JLabel label_chatroom;
	
	private JTextField input_username;
	private JPasswordField input_password;
	private JTextField input_chatroom;
	
	private List chatrooms;
	private Link button_lost_password;
	private Link button_register;
	private JButton button_login;
	
	public Login(Client client) {
		this.client = client;
		this.panel_buttons = new JPanel();
		this.panel_top = new JPanel();
		this.label_username = new JLabel();
		this.input_username = new JTextField();
		this.label_password = new JLabel();
		this.input_password = new JPasswordField();
		this.label_chatroom = new JLabel();
		this.input_chatroom = new JTextField();
		this.button_register = new Link();
		this.button_lost_password = new Link();
		this.panel_middle = new JPanel();
		this.chatrooms = new List();
		this.panel_bottom = new JPanel();
		this.button_login = new JButton();
		
		/* Top */
		GridBagLayout form = new GridBagLayout();
		this.panel_top.setMinimumSize(new Dimension(80, 385));
		this.panel_top.setBorder(new EmptyBorder(15, 15, 15, 15));
		this.panel_top.setLayout(form);
		form.columnWidths	= new int[] {0, 0, 0, 0};
		form.rowHeights		= new int[] {0, 0, 0, 0, 0};
		form.columnWeights	= new double[] {0, 0, 1, 1};
		form.rowWeights		= new double[] {0, 0, 0, 0, 1};
		
		/* Form: Username */
		this.label_username.setText("Benutzername:");
		this.label_username.setHorizontalAlignment(SwingConstants.RIGHT);
		this.panel_top.add(this.label_username, new GridBagConstraints(0, 0, 1, 1, 0.0, 0.0, GridBagConstraints.CENTER, GridBagConstraints.BOTH, new Insets(0, 0, 5, 5), 0, 0));
		this.panel_top.add(this.input_username, new GridBagConstraints(1, 0, 2, 1, 0.0, 0.0, GridBagConstraints.CENTER, GridBagConstraints.BOTH, new Insets(0, 0, 5, 0), 0, 0));
	
		/* Form: Password */
		this.label_password.setText("Passwort:");
		this.label_password.setHorizontalAlignment(SwingConstants.RIGHT);
		this.panel_top.add(this.label_password, new GridBagConstraints(0, 1, 1, 1, 0.0, 0.0, GridBagConstraints.CENTER, GridBagConstraints.BOTH, new Insets(0, 0, 5, 5), 0, 0));
		this.panel_top.add(this.input_password, new GridBagConstraints(1, 1, 2, 1, 0.0, 0.0, GridBagConstraints.CENTER, GridBagConstraints.BOTH, new Insets(0, 0, 5, 0), 0, 0));

		/* Form: Chatroom */
		this.label_chatroom.setText("Chatraum:");
		this.label_chatroom.setHorizontalAlignment(SwingConstants.RIGHT);
		this.panel_top.add(this.label_chatroom, new GridBagConstraints(0, 2, 1, 1, 0.0, 0.0, GridBagConstraints.CENTER, GridBagConstraints.BOTH, new Insets(0, 0, 0, 5), 0, 0));
		this.panel_top.add(this.input_chatroom, new GridBagConstraints(1, 2, 2, 1, 0.0, 0.0, GridBagConstraints.CENTER, GridBagConstraints.BOTH, new Insets(0, 0, 0, 0), 0, 0));
		
		this.panel_buttons.setLayout(new BorderLayout());
		this.panel_top.add(this.panel_buttons, new GridBagConstraints(1, 3, 2, 1, 0.0, 0.0, GridBagConstraints.CENTER, GridBagConstraints.BOTH, new Insets(0, 0, 5, 0), 0, 0));
		
		/* Form: Button "Lost Password?" */
		this.button_lost_password.setText("Password vergessen?");
		this.panel_buttons.add(this.button_lost_password, BorderLayout.WEST);
		
		/* Form: Button "Register" */
		this.button_register.setText("Neu registrieren");
		this.panel_buttons.add(this.button_register, BorderLayout.EAST);
		
		/* Middle */
		this.panel_middle.setBorder(new EmptyBorder(10, 10, 10, 10));
		this.panel_middle.setLayout(new BorderLayout());
		this.chatrooms.setBackground(Color.red);
		this.chatrooms.setLayout(null);
		this.panel_middle.add(this.chatrooms, BorderLayout.CENTER);
		
		/* Bottom */
		this.panel_bottom.setBorder(new EmptyBorder(10, 10, 10, 10));
		this.panel_bottom.setLayout(new BorderLayout());

		/* Button "Login" */
		this.button_login.setText("Einloggen");
		this.button_login.addActionListener(event -> this.onLogin(event));
		this.panel_bottom.add(this.button_login, BorderLayout.CENTER);
		
		/* General */
		this.setMinimumSize(new Dimension(80, 385));
		this.setLayout(new BorderLayout());
		this.add(this.panel_top, BorderLayout.NORTH);
		this.add(this.panel_middle, BorderLayout.CENTER);
		this.add(this.panel_bottom, BorderLayout.SOUTH);
	}
	
	public void setSuggestion(String chatroom) {
		this.input_chatroom.setText(chatroom);
	}
	
	public void update() {
		this.chatrooms.updateUI();
	}
	
	public void clearChatrooms() {
		this.chatrooms.clearEntrys();
	}
	
	public void addChatroom(String name) {
		this.chatrooms.addEntry(name);
	}

	private void onLogin(ActionEvent event) {
		this.client.send(new Protocol.Login(this.input_username.getText(), this.input_password.getPassword(), this.input_chatroom.getText()));
	}
}
