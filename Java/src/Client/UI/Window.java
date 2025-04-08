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
import java.awt.Dimension;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;
import javax.swing.JFrame;
import Client.Client;
import Client.ICallback;
import Client.WindowManager;
import Client.UI.Components.Input;
import Client.UI.Components.List;
import Client.UI.Components.TextPanel;
import Protocol.Rank;
import Protocol.Room;
import Protocol.RoomMessage;
import Protocol.User;
import Protocol.WindowClose;
import Protocol.WindowInit;

@SuppressWarnings("serial")
public class Window extends JFrame {
	private Client client			= null;
	private List userlist			= new List();
	private TextPanel panel_output	= new TextPanel();
	private Input panel_input		= new Input();
	
	public Window(Client client) {
		this.client = client;
		
		this.setDefaultCloseOperation(JFrame.DO_NOTHING_ON_CLOSE);
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
		this.panel_output.addMessage(TextPanel.Type.PUBLIC, "<strong>" + user.getName() + ":</strong> " + text);
	}
	
	public void addPrivateMessage(String username, User[] users, String text) {
		String target = "";
		
		if(username == null) {
			username = "System";
		}

		if(username != "System" && users.length >= 1) {
			target = " an " + ""; //String.join(", ", users);
		}
		
		this.panel_output.addMessage(TextPanel.Type.PUBLIC, "<strong style=\"color: #FF0000;\">" + username + " (privat" + target + "):</strong> " + text);
	}
	
	public void addActionMessage(String text) {
		this.panel_output.addMessage(TextPanel.Type.ACTION, text);
	}
	
	public void init() {
		this.setVisible(true);
		this.client.send(new WindowInit(this.getName()));
	}
	
	public void update() {
		this.revalidate();
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

	public void setStyle(Room room, Rank[] ranks) {
		// TODO
		this.update();
	}

	public void addUser(User user) {
		this.removeUser(user);
		this.userlist.addEntry(user.getName(), user.getName());
	}
	
	public void removeUser(User user) {
		this.userlist.removeEntry(user.getName());
	}
}
