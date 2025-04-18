/**
 * Mein Chatserver
 * ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
 * Licensed Materials - Property of mein-chatserver.de.
 * © Copyright 2024. All Rights Reserved.
 *
 * @version 1.0.0
 * @author Adrian Preuß
 */

package Client;

import java.awt.Dimension;
import java.awt.event.WindowEvent;
import java.awt.event.WindowListener;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;
import java.net.SocketException;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import Client.UI.Chatroom;
import Client.UI.Login;
import Client.UI.Settings;
import Client.UI.Components.Dialog;
import Client.UI.Components.Window;
import Interfaces.IChatroom;
import Interfaces.IPacket;
import Protocol.BackgroundImage;
import Protocol.LoginStyle;
import Protocol.Packet;
import Protocol.Ping;
import Protocol.Pong;
import Protocol.Room;
import Protocol.Style;
import Protocol.User;
import Protocol.Receive.Category;
import Protocol.Receive.Configuration;
import Protocol.Receive.MessageAction;
import Protocol.Receive.MessagePrivate;
import Protocol.Receive.MessagePublic;
import Protocol.Receive.RoomUpdate;
import Protocol.Receive.RoomUserAdd;
import Protocol.Receive.RoomUserRemove;
import Protocol.Send.Disconnect;
import Protocol.Send.Handshake;

public class Client implements Runnable {
	private Thread thread = new Thread(this);
	private Window window = new Window(this);
	private Settings settings = new Settings(this);
	private Login login;
	private boolean connected = false;
	private String Client = "JavaClient";
	private String Version = "V1.0";
	private ScheduledExecutorService ping = Executors.newScheduledThreadPool(1);
	private ObjectMapper objects = new ObjectMapper();
	private String hostname;
	private int port;
	private Socket socket;
	private InputStream input;
	private OutputStream output;

	public Client() {
		this.login = new Login(this);
	}

	public Client(String hostname, int port) {
		super();
		this.hostname = hostname;
		this.port = port;
		this.start();
	}

	public void start() {
		System.out.println("www.mein-chatserver.de - " + this.Client + " " + this.Version + ". Copyright © 2024 by Mein Chatserver. All Rights Reserved.");

		this.settings.update();
		this.window.setTitle("Chat " + this.Client + " (" + this.Version + ")");
		this.window.addWindowListener(new WindowListener() {
			@Override
			public void windowClosing(WindowEvent e) {
				send(new Disconnect());
				WindowManager.closeAll();
			}

			@Override
			public void windowClosed(WindowEvent e) {
				window.dispose();
				System.exit(0);
			}

			@Override
			public void windowOpened(WindowEvent e) {
			}

			@Override
			public void windowIconified(WindowEvent e) {
			}

			@Override
			public void windowDeiconified(WindowEvent e) {
			}

			@Override
			public void windowDeactivated(WindowEvent e) {
			}

			@Override
			public void windowActivated(WindowEvent e) {
			}
		});

		this.window.setContentPane(this.login);
		this.window.setSize(new Dimension(300, 450));
		this.window.setPreferredSize(new Dimension(300, 450));
		this.window.setMinimumSize(new Dimension(300, 450));
		this.window.pack();
		this.window.setVisible(true);

		this.connect(false);
	}

	public String getVersion() {
		return this.Version;
	}

	public String getName() {
		return this.Client;
	}

	public String getHostname() {
		return this.hostname;
	}

	public void setHostname(String hostname) {
		this.hostname = hostname;
		this.settings.update();
	}

	public int getPort() {
		return this.port;
	}

	public void setPort(int port) {
		this.port = port;
		this.settings.update();
	}

	public void setServer(String hostname, int port) {
		this.disconnect(true);
		this.hostname = hostname;
		this.port = port;
		this.settings.update();

		this.login.setDisconnected();
		this.login.clearChatrooms();
		this.login.setSuggestion("");
		this.login.setStyle(null);

		this.connect(true);
	}

	public Settings getSettings() {
		return this.settings;
	}

	public void send(IPacket clazz) {
		if(!this.isConnected()) {
			return;
		}

		try {
			Packet packet = new Packet(clazz.getOperation(), clazz);
			ObjectMapper mapper = new ObjectMapper();
			byte[] bytes = mapper.writeValueAsBytes(packet);

			this.output.write(ByteBuffer.allocate(4).putInt(bytes.length).array());
			this.output.write(bytes);
			this.output.flush();

			System.out.println("[SEND] " + new String(bytes));
		} catch(SocketException e) {
			this.onClose("DISCONNECTED");
			this.onError(e);
		} catch(Exception e) {
			this.onError(e);
		}
	}

	public void connect(boolean hard) {
		try {
			this.disconnect(hard);

			this.socket = new Socket(this.hostname, this.port);
			this.input = this.socket.getInputStream();
			this.output = this.socket.getOutputStream();

			this.thread = new Thread(this);
			this.thread.start();

			this.onConnected();
		} catch(SocketException e) {
			this.onClose("DISCONNECTED");
			this.onError(e);
		} catch(IOException e) {
			this.onError(e);
		}
	}

	public void disconnect(boolean hard) {
		try {
			/* Sending Disconnect */
			if(this.isConnected()) {
				this.send(new Disconnect());
				this.connected = false;
			}

			if(this.thread != null && this.thread.isAlive()) {
				this.thread.interrupt();
			}

			/* Close all Frames */
			if(hard) {
				WindowManager.closeAll();
			}
		} catch(Exception e) {
			this.onError(e);
		} finally {
			this.connected = false;
			this.socket = null;
			this.input = null;
			this.output = null;
		}
	}

	public boolean isConnected() {
		if(this.socket == null || this.socket.isClosed() || this.input == null || this.output == null) {
			return false;
		}

		return this.connected;
	}

	@Override
	public void run() {
		while(this.isConnected()) {
			synchronized(this.input) {
				try {
					byte[] lengthBytes = this.input.readNBytes(4);

					if(lengthBytes.length < 4) {
						continue;
					}

					int length = ByteBuffer.wrap(lengthBytes).getInt();
					byte[] dataBytes = this.input.readNBytes(length);

					if(dataBytes.length < length) {
						continue;
					}

					String response = new String(dataBytes, StandardCharsets.UTF_8);

					if(response != null) {
						Packet packet = objects.readValue(response, Packet.class);
						String json = objects.writer().withDefaultPrettyPrinter().writeValueAsString(packet.data);

						this.onReceive(packet, json, response);
					}
				} catch(Exception e) {
					this.onError(e);
				}
			}
		}
	}

	protected void onConnected() {
		this.connected = true;
		this.login.setConnected();

		WindowManager.setConnected();

		// Reset Ping
		// this.ping.shutdownNow();

		System.out.println("Connected...");

		// Send Handshake
		this.send(new Handshake(this.Client, this.Version));
	}

	protected void onClose(String error) {
		this.connected = false;

		// Reset Ping
		// this.ping.shutdownNow();

		this.disconnect(false);
		WindowManager.setDisconnected();
		this.login.setDisconnected();

		// create Timeout for reconnect

		System.err.println("Socket: onClose = " + error);
	}

	protected void onError(Exception e) {
		System.err.println("[Error] " + e.getMessage());
		e.printStackTrace();
	}

	protected void onReceive(Packet packet, String json, String response) throws JsonMappingException, JsonProcessingException {
		Chatroom window;

		this.connected = true;
		System.err.println("[RECEIVE] " + packet.operation + ", " + json);

		switch(packet.operation) {
			case "CONFIGURATION":
				Configuration config = objects.readerFor(Configuration.class).readValue(json);

				/* Preload Image over ImageCache */
				LoginStyle style = config.getStyle();

				if(style != null) {
					style.getBackgroundImage();
				}

				this.login.showLoginButton();
				this.login.setSuggestion(config.getSuggestion());
				this.login.setStyle(config.getStyle());

				// Create Ping
				// this.ping.shutdownNow();

				this.ping.scheduleAtFixedRate(new Runnable() {
					@Override
					public void run() {
						if(!isConnected()) {
							return;
						}

						send(new Ping());
					}
				}, 10, 10, TimeUnit.SECONDS);
			break;
			case "PING":
				send(new Pong());
			break;
			case "PONG":
			// @ToDo
			break;
			case "ROOMS_CATEGORIES":
				List<Category> categories = objects.readValue(json, objects.getTypeFactory().constructCollectionType(List.class, Category.class));

				this.login.clearCategories();
				this.login.addCategory(new Category(0, "Alle Chaträume"));

				for(Category category : categories) {
					this.login.addCategory(category);
				}
			break;
			case "ROOMS":
				List<Room> rooms = objects.readValue(json, objects.getTypeFactory().constructCollectionType(List.class, Room.class));

				this.login.clearChatrooms();

				for(Room room : rooms) {
					/* Preload Image over ImageCache */
					Style style1 = room.getStyle();

					if(style1 != null) {
						BackgroundImage bg = style1.getBackgroundImage();

						if(bg != null) {
							bg.getImage();
						}
					}

					this.login.addChatroom(room);
				}

				this.login.update();
			break;
			case "WINDOW_ROOM":
			case "WINDOW_ROOM_UPDATE":
				Protocol.Window data = objects.readerFor(Protocol.Window.class).readValue(json);

				/* Preload Image over ImageCache */
				Style style1 = data.room.getStyle();

				if(style1 != null) {
					BackgroundImage bg = style1.getBackgroundImage();

					if(bg != null) {
						bg.getImage();
					}
				}

				Chatroom frame;

				if(data.hasReference()) {
					frame = WindowManager.get(data.getReference());
					WindowManager.remove(data.getReference());
					WindowManager.add(data.name, frame);
					frame.setSize(new Dimension(data.width, data.height));
					frame.setName(data.name);
					frame.init();
				} else {
					frame = WindowManager.create(this, data.name, data.width, data.height);
				}

				frame.setTitle(data.title);
				frame.update(data.room, data.ranks);

				frame.clearUsers();

				for(User user : data.getRoom().getUsers()) {
					frame.addUser(user);
				}

				frame.requestFocus();
			break;
			case "ROOM_UPDATE":
				RoomUpdate update = objects.readerFor(RoomUpdate.class).readValue(json);

				/* Preload Image over ImageCache */
				Style style11 = update.getStyle();

				if(style11 != null) {
					BackgroundImage bg = style11.getBackgroundImage();

					if(bg != null) {
						bg.getImage();
					}
				}

				window = WindowManager.get(update.getName());

				if(window != null) {
					window.update(update, null);

					window.clearUsers();

					for(User user : update.getUsers()) {
						window.addUser(user);
					}
				}
			break;
			case "ROOM_USER_ADD":
				RoomUserAdd user = objects.readerFor(RoomUserAdd.class).readValue(json);

				window = WindowManager.get(user.getRoom());

				if(window != null) {
					window.addUser(user.getUser());
				}
			break;
			case "ROOM_USER_REMOVE":
				RoomUserRemove user2 = objects.readerFor(RoomUserRemove.class).readValue(json);

				window = WindowManager.get(user2.getRoom());

				if(window != null) {
					window.removeUser(user2.getUser());
				}
			break;
			case "MESSAGE_PUBLIC":
				MessagePublic publicMessage = objects.readerFor(MessagePublic.class).readValue(json);
				String room3 = null;

				if(publicMessage.getRoom() != null) {
					room3 = publicMessage.getRoom();

					if(room3.equals("-")) {
						room3 = null;
					}
				}

				if(room3 == null) {
					WindowManager.each(new IChatroom() {
						@Override
						public void execute(Chatroom room) {
							room.addPublicMessage(publicMessage.getSender(), publicMessage.getText());
						}

					});
				} else {
					window = WindowManager.get(room3);

					if(window != null) {
						window.addPublicMessage(publicMessage.getSender(), publicMessage.getText());
					}
				}
			break;
			case "MESSAGE_PRIVATE":
				MessagePrivate privateMessage = objects.readerFor(MessagePrivate.class).readValue(json);
				String room = null;

				if(privateMessage.getRoom() != null) {
					room = privateMessage.getRoom();

					if(room.equals("-")) {
						room = null;
					}
				}

				if(room == null) {
					WindowManager.each(new IChatroom() {
						@Override
						public void execute(Chatroom room) {
							room.addPrivateMessage(privateMessage.getSender(), privateMessage.getUsers(), privateMessage.getText());
						}

					});
				} else {
					window = WindowManager.get(room);

					if(window != null) {
						window.addPrivateMessage(privateMessage.getSender(), privateMessage.getUsers(), privateMessage.getText());
					}
				}
			break;
			case "MESSAGE_ACTION":
				MessageAction actionMessage = objects.readerFor(MessageAction.class).readValue(json);
				String room2 = null;

				if(actionMessage.getRoom() != null) {
					room2 = actionMessage.getRoom();

					if(room2.equals("-")) {
						room2 = null;
					}
				}

				if(room2 == null) {
					WindowManager.each(new IChatroom() {
						@Override
						public void execute(Chatroom room) {
							room.addActionMessage(actionMessage.getText());
						}
					});
				} else {
					window = WindowManager.get(room2);

					if(window != null) {
						window.addActionMessage(actionMessage.getText());
					}
				}
			break;
			case "POPUP":
				new Dialog("Problem", (String) packet.data);
			break;
			case "DISCONNECT":
				this.disconnect(false);
				WindowManager.setDisconnected();
				this.login.setDisconnected();
			break;
			default:
				System.err.println("[RECEIVE] Unknown Operation: " + packet.operation + ", " + json);
			break;
		}
	}

	public void setSettings(boolean state) {
		this.login.toggleSettings(state);
	}
}