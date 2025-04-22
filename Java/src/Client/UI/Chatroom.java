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
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;

import javax.swing.JFrame;
import javax.swing.WindowConstants;

import Client.Client;
import Client.Utils;
import Client.WindowManager;
import Client.UI.Style.StyleObserver;
import Client.UI.Components.Input;
import Client.UI.Components.List;
import Client.UI.Components.TextPanel;
import Interfaces.ICallback;
import Protocol.Rank;
import Protocol.Room;
import Protocol.User;
import Protocol.Receive.RoomMessage;
import Protocol.Send.WindowClose;
import Protocol.Send.WindowInit;

public class Chatroom extends JFrame implements StyleObserver {
	private Client client = null;
	private List userlist = new List();
	private TextPanel panel_output = new TextPanel();
	private Input panel_input = new Input();
	private Style style = new Style();

	public Chatroom(Client client) {
		super();

		this.client = client;
		this.style.addObserver(this);
		this.style.addObserver(this.panel_output);
		this.style.addObserver(this.userlist);
		this.setDefaultCloseOperation(WindowConstants.DO_NOTHING_ON_CLOSE);
		this.addWindowListener(new WindowAdapter() {
			@Override
			public void windowClosing(WindowEvent e) {
				close();
			}

			@Override
			public void windowActivated(WindowEvent e) {
				panel_input.setText("");
				panel_input.requestFocus();
			}
		});

		this.userlist.onSelect(new ICallback() {
			@Override
			public void execute(String message) {
				// Click on User
			}
		});

		this.userlist.setPreferredSize(new Dimension(250, this.getHeight()));
		this.panel_input.setPlaceholder("Gebe eine Nachricht ein...");
		this.panel_input.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				// @ToDo Check selected users
				client.send(new RoomMessage(getName(), panel_input.getText()));
				panel_input.setText("");
				panel_input.requestFocus();
			}
		});

		this.setLayout(new BorderLayout());
		this.add(this.panel_output, BorderLayout.CENTER);
		this.add(this.userlist, BorderLayout.EAST);
		this.add(this.panel_input, BorderLayout.SOUTH);
		this.update();
	}

	public void addPublicMessage(User user, String text) {
		this.panel_output.addMessage(TextPanel.Type.PUBLIC, "<strong>" + user.getName() + ":</strong> " + Utils.escapeHTML(text));
	}

	public void addPrivateMessage(User user, String[] users, String text) {
		String username = "";
		String target = "";

		if(user == null) {
			username = "System";
		} else {
			username = user.getName();
		}

		if(username != "System" && users.length >= 1) {
			target = " an " + ""; // String.join(", ", users);
		}

		this.panel_output.addMessage(TextPanel.Type.PUBLIC, "<strong style=\"color: #FF0000;\">" + user + " (privat" + target + "):</strong> " + Utils.escapeHTML(text));
	}

	public void addActionMessage(String text) {
		this.panel_output.addMessage(TextPanel.Type.ACTION, Utils.escapeHTML(text));
	}

	public void init() {
		this.setVisible(true);
		this.client.send(new WindowInit(this.getName()));
	}

	public void update() {
		this.revalidate();
	}

	public void update(Room room, Rank[] ranks) {
		this.panel_output.setColors(room.getStyle().getOutput());
		this.panel_output.setBackground(room.getStyle().getBackgroundColor(), room.getStyle().getBackgroundImage());
		this.userlist.setBackground(room.getStyle().getBackgroundColor());
		this.userlist.setColors(room.getStyle().getRanks());
		this.update();
	}

	public void close() {
		WindowManager.remove(this.getName());
		this.client.send(new WindowClose(this.getName()));
		this.dispose();
	}

	public void setConnected() {
		this.panel_input.setDisabled(false, "Gebe eine Nachricht ein...");
		this.update();
	}

	public void setDisconnected() {
		this.panel_input.setDisabled(true, "Verbindung getrennt. Bitte verbinde dich neu..."); // @ToDo I18N
		this.update();
	}

	public void addUser(User user) {
		this.removeUser(user);
		this.userlist.addEntry(user.getName(), user.getName());
	}

	public void removeUser(User user) {
		this.userlist.removeEntry(user.getName());
	}

	public void clearUsers() {
		this.userlist.clearEntrys();
	}

	@Override
	public void update(Style style) {
		// TODO Auto-generated method stub

	}
}
