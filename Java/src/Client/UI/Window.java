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
import javax.swing.JPanel;
import javax.swing.JTextField;
import Client.Client;
import Client.ICallback;
import Client.WindowManager;
import Client.UI.Components.List;
import Protocol.Rank;
import Protocol.Room;
import Protocol.RoomMessage;
import Protocol.User;
import Protocol.WindowClose;
import Protocol.WindowInit;

@SuppressWarnings("serial")
public class Window extends JFrame {
	private Client client = null;
	private List userlist = new List();
	private JTextField panel_input = new JTextField();
	
	public Window(Client client) {
		this.client = client;
		
		this.setDefaultCloseOperation(JFrame.DO_NOTHING_ON_CLOSE);
		this.addWindowListener(new WindowAdapter() {
            public void windowClosing(WindowEvent e) {
            	close();
            }
        });
		
		JPanel panel_output = new JPanel();
		//panel_output.setBackground(Color.red);
		this.userlist.onSelect(new ICallback() {
            @Override
            public void execute(String message) {
            	// Click on User
            }
        });
		
		this.userlist.setPreferredSize(new Dimension(250, this.getHeight()));
		
		panel_input.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				// @ToDo Check selected users
				client.send(new RoomMessage(getName(), panel_input.getText()));
				panel_input.setText("");
				panel_input.requestFocus();
			}
		});
		
		this.setLayout(new BorderLayout());
		this.add(panel_output, BorderLayout.CENTER);
		this.add(this.userlist, BorderLayout.EAST);
		this.add(panel_input, BorderLayout.SOUTH);
		this.update();
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
		panel_input.setText("");
		panel_input.setEnabled(true);
		this.update();
	}

	public void setDisconnected() {
		panel_input.setText("Verbindung getrennt. Bitte verbinde dich neu..."); // @ToDo I18N
		panel_input.setEnabled(false);
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
