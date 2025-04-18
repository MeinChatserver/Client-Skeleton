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
import java.awt.Color;
import java.awt.Desktop;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.net.URI;

import javax.swing.JComboBox;
import javax.swing.JPasswordField;
import javax.swing.JTextField;
import javax.swing.SwingConstants;
import javax.swing.border.EmptyBorder;

import Client.Client;
import Client.UI.Components.Button;
import Client.UI.Components.Label;
import Client.UI.Components.Link;
import Client.UI.Components.List;
import Client.UI.Components.Panel;
import Interfaces.ICallback;
import Protocol.LoginStyle;
import Protocol.Room;
import Protocol.Receive.Category;
import Protocol.Send.CategoryChange;

public class Login extends Panel {
	private Client client;

	/* Panels */
	private Panel panel_icons = new Panel();
	private Panel panel_header = new Panel();
	private Panel panel_top = new Panel();
	private Panel panel_middle = new Panel();
	private Panel panel_bottom = new Panel();
	private Panel panel_buttons = new Panel();

	/* Labels */
	private Label label_username = new Label();
	private Label label_password = new Label();
	private Label label_chatroom = new Label();
	private Label label_category = new Label();

	private JTextField input_username;
	private JPasswordField input_password;
	private JTextField input_chatroom;
	private JComboBox<Category> input_category;

	private List chatrooms = new List();
	private Link button_lost_password;
	private Link button_register;
	private Link button_settings;
	private Button button_login;

	public Login(Client client) {
		this.client = client;
		this.input_username = new JTextField();
		this.input_password = new JPasswordField();
		this.input_chatroom = new JTextField();
		this.input_category = new JComboBox<>();
		this.button_register = new Link();
		this.button_lost_password = new Link();
		this.button_login = new Button();

		this.panel_icons = new Panel();
		this.button_settings = new Link(Bootstrap.get(Bootstrap.Icons.GEAR, 18, Color.WHITE), Bootstrap.get(Bootstrap.Icons.GEAR, 18, Color.RED));
		this.button_settings.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				client.getSettings().open();
			}
		});
		this.panel_icons.setLayout(new FlowLayout(FlowLayout.RIGHT));
		this.panel_icons.setBorder(new EmptyBorder(5, 10, 0, 10));
		this.panel_icons.add(this.button_settings);
		this.panel_header.setLayout(new BorderLayout());
		this.panel_header.add(panel_icons, BorderLayout.NORTH);
		this.panel_header.add(this.panel_top, BorderLayout.CENTER);

		/* Top */
		GridBagLayout form = new GridBagLayout();
		this.panel_top.setMinimumSize(new Dimension(80, 385));
		this.panel_top.setBorder(new EmptyBorder(15, 15, 5, 15));
		form.columnWidths = new int[] { 0, 0, 0, 0 };
		form.rowHeights = new int[] { 0, 0, 0, 0, 0 };
		form.columnWeights = new double[] { 0, 0, 1 };
		form.rowWeights = new double[] { 0, 0, 0, 1 };
		this.panel_top.setLayout(form);

		/* Form: Username */
		this.label_username.setText("Benutzername:");
		this.label_username.setHorizontalAlignment(SwingConstants.RIGHT);
		this.panel_top.add(this.label_username, new GridBagConstraints(0, 0, 1, 1, 0.0, 0.0, GridBagConstraints.CENTER, GridBagConstraints.BOTH, new Insets(0, 0, 5, 5), 0, 0));
		this.panel_top.add(this.input_username, new GridBagConstraints(1, 0, 2, 1, 0.0, 0.0, GridBagConstraints.CENTER, GridBagConstraints.BOTH, new Insets(0, 0, 5, 0), 0, 0));
		this.input_username.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				input_password.requestFocus();
			}
		});

		/* Form: Password */
		this.label_password.setText("Passwort:");
		this.label_password.setHorizontalAlignment(SwingConstants.RIGHT);
		this.panel_top.add(this.label_password, new GridBagConstraints(0, 1, 1, 1, 0.0, 0.0, GridBagConstraints.CENTER, GridBagConstraints.BOTH, new Insets(0, 0, 5, 5), 0, 0));
		this.panel_top.add(this.input_password, new GridBagConstraints(1, 1, 2, 1, 0.0, 0.0, GridBagConstraints.CENTER, GridBagConstraints.BOTH, new Insets(0, 0, 5, 0), 0, 0));
		this.input_password.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				input_chatroom.requestFocus();
			}
		});

		/* Form: Chatroom */
		this.label_chatroom.setText("Chatraum:");
		this.label_chatroom.setHorizontalAlignment(SwingConstants.RIGHT);
		this.panel_top.add(this.label_chatroom, new GridBagConstraints(0, 2, 1, 1, 0.0, 0.0, GridBagConstraints.CENTER, GridBagConstraints.BOTH, new Insets(0, 0, 0, 5), 0, 0));
		this.panel_top.add(this.input_chatroom, new GridBagConstraints(1, 2, 2, 1, 0.0, 0.0, GridBagConstraints.CENTER, GridBagConstraints.BOTH, new Insets(0, 0, 0, 0), 0, 0));
		this.input_chatroom.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				button_login.doClick();
			}
		});

		this.panel_buttons.setLayout(new BorderLayout());
		this.panel_buttons.setBorder(new EmptyBorder(10, 0, 0, 0));
		this.panel_top.add(this.panel_buttons, new GridBagConstraints(1, 3, 2, 1, 0.0, 0.0, GridBagConstraints.CENTER, GridBagConstraints.BOTH, new Insets(0, 0, 5, 0), 0, 0));

		/* Form: Button "Lost Password?" */
		this.button_lost_password.setText("Password vergessen?");
		// this.panel_buttons.add(this.button_lost_password, BorderLayout.WEST);
		this.button_lost_password.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				try {
					URI uri = new URI("https://" + client.getHostname() + "/Password");

					if(Desktop.isDesktopSupported()) {
						Desktop.getDesktop().browse(uri);
					}
				} catch(Exception e1) {
				}
			}
		});

		/* Form: Button "Register" */
		this.button_register.setText("Neu registrieren");
		this.panel_buttons.add(this.button_register, BorderLayout.EAST);
		this.button_register.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				try {
					URI uri = new URI("https://" + client.getHostname() + "/Register");

					if(Desktop.isDesktopSupported()) {
						Desktop.getDesktop().browse(uri);
					}
				} catch(Exception e1) {
				}
			}
		});

		/* Middle */
		this.panel_middle.setMinimumSize(new Dimension(80, 385));
		this.panel_middle.setBorder(new EmptyBorder(0, 15, 0, 15));
		form = new GridBagLayout();
		form.columnWidths = new int[] { 0, 0, 0, 0 };
		form.rowHeights = new int[] { 0, 0, 0, 0, 0 };
		form.columnWeights = new double[] { 0, 0, 1 };
		form.rowWeights = new double[] { 0, 0, 0, 1 };
		this.panel_middle.setLayout(form);

		this.label_category.setText("Kategorie:");
		this.label_category.setHorizontalAlignment(SwingConstants.RIGHT);
		this.panel_middle.add(this.label_category, new GridBagConstraints(0, 0, 1, 1, 0.0, 0.0, GridBagConstraints.CENTER, GridBagConstraints.BOTH, new Insets(0, 0, 5, 5), 0, 0));
		this.panel_middle.add(this.input_category, new GridBagConstraints(1, 0, 2, 1, 0.0, 0.0, GridBagConstraints.CENTER, GridBagConstraints.BOTH, new Insets(0, 0, 5, 0), 0, 0));
		this.input_category.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				Category obj = (Category) input_category.getSelectedItem();

				if(obj != null) {
					client.send(new CategoryChange(obj.getID()));
				}
			}
		});

		this.chatrooms.onSelect(new ICallback() {
			@Override
			public void execute(String message) {
				setSuggestion(message);
			}
		});
		this.panel_middle.add(this.chatrooms, new GridBagConstraints(0, 3, 3, 1, 0.0, 0.0, GridBagConstraints.CENTER, GridBagConstraints.BOTH, new Insets(0, 0, 5, 0), 0, 0));

		/* Bottom */
		this.panel_bottom.setBorder(new EmptyBorder(5, 10, 10, 10));
		this.panel_bottom.setLayout(new BorderLayout());

		/* Button "Login" */
		this.button_login.setText("Einloggen");
		this.button_login.addActionListener(event -> this.onLogin(event));
		this.panel_bottom.add(this.button_login, BorderLayout.CENTER);

		/* General */
		this.setLayout(new BorderLayout());
		this.add(this.panel_header, BorderLayout.NORTH);
		this.add(this.panel_middle, BorderLayout.CENTER);
		this.add(this.panel_bottom, BorderLayout.SOUTH);
	}

	public void setSuggestion(String chatroom) {
		this.input_chatroom.setText(chatroom);
	}

	public void clearChatrooms() {
		this.chatrooms.clearEntrys();
	}

	public void addChatroom(Room room) {
		if(room == null) {
			return;
		}

		this.chatrooms.addEntry(room.getName(), room.getName() + " (" + room.getUsers().size() + ")");
	}

	public void clearCategories() {
		this.input_category.removeAllItems();
	}

	public void addCategory(Category category) {
		this.input_category.addItem(new Category() {
			@Override
			public String toString() {
				return category.getName();
			}

			@Override
			public int getID() {
				return category.getID();
			}
		});
	}

	private void onLogin(ActionEvent event) {
		if(!this.client.isConnected()) {
			this.button_login.setText("Verbinde."); // @ToDo I18N
			this.client.connect(false);
			return;
		}

		this.client.send(new Protocol.Send.Login(this.input_username.getText(), this.input_password.getPassword(), this.input_chatroom.getText()));
	}

	public void setConnected() {
		this.button_login.setText("Einloggen"); // @ToDo I18N
	}

	public void setDisconnected() {
		this.button_login.setText("Erneut verbinden"); // @ToDo I18N
	}

	public void showLoginButton() {
		this.button_login.setText("Einloggen"); // @ToDo I18N
	}

	public void setStyle(LoginStyle style) {
		this.client.getSettings().setStyle(style);

		if(style == null) {
			this.setBackground(null, null);
			this.setForeground(null);
			this.chatrooms.getRootPane().setBackground(null);
			this.chatrooms.setForeground(null);
			return;
		}

		this.setBackground(style.getBackground().getColor(), style.getBackgroundImage());
		this.setForeground(style.getForeground().getColor());
		this.chatrooms.setBackground(style.getBackgroundList().getColor());
		this.chatrooms.setForeground(style.getForegroundList().getColor());
	}

	public void toggleSettings(boolean state) {
		this.button_settings.setVisible(state);
	}
}
