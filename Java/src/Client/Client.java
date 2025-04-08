/**
 * Mein Chatserver
 * ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
 * Licensed Materials - Property of mein-chatserver.de.
 * © Copyright 2024. All Rights Reserved.
 *
 * @version 1.0.0
 * @author  Adrian Preuß
 */

package Client;

import java.awt.Dimension;
import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;
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
import javax.swing.JDialog;
import javax.swing.JFrame;
import javax.swing.JOptionPane;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import Client.UI.Login;
import Client.UI.Window;
import Protocol.Category;
import Protocol.Configuration;
import Protocol.Disconnect;
import Protocol.Handshake;
import Protocol.IPacket;
import Protocol.MessageAction;
import Protocol.MessagePrivate;
import Protocol.MessagePublic;
import Protocol.Packet;
import Protocol.Ping;
import Protocol.Pong;
import Protocol.Room;
import Protocol.RoomUpdate;
import Protocol.RoomUserAdd;
import Protocol.RoomUserRemove;
import Protocol.User;

public class Client implements Runnable {
	private JFrame window					= new JFrame();
	private Login login						= new Login(this);
    private String Client   				= "JavaClient";
    private String Version  				= "V1.0";
    private ScheduledExecutorService ping	= Executors.newScheduledThreadPool(1);
    private ObjectMapper objects			= new ObjectMapper();
    private String hostname;
    private int port;
    private Socket socket;
    private OutputStream output;
    private InputStream input;
    
    public Client(String hostname, int port) {
        this.hostname   = hostname;
        this.port       = port;

        System.out.println("www.mein-chatserver.de - " + this.Client + " " + this.Version + ". Copyright © 2024 by Mein Chatserver. All Rights Reserved.");

        this.window.setTitle("Chat " + this.Client + " (" + this.Version + ")");
        this.window.setContentPane(this.login);
        this.window.setSize(new Dimension(300, 450));
        this.window.setPreferredSize(new Dimension(300, 450));
		this.window.setMinimumSize(new Dimension(300, 450));
        this.window.pack();
        this.window.setVisible(true);
        
        new Thread(this).start();
    }

    public String getHostname() {
    	return this.hostname;
    }
    
    public void send(IPacket clazz) {
    	if(!this.isConnected()) {
			return;
		}
    	
        try {
        	Packet packet		= new Packet(clazz.getOperation(), clazz);
            ObjectMapper mapper	= new ObjectMapper();
            byte[] bytes		= mapper.writeValueAsBytes(packet);

        	System.out.println("[SEND] " + new String(bytes));
        
            output.write(ByteBuffer.allocate(4).putInt(bytes.length).array());
            output.write(bytes);
            output.flush();
        } catch(SocketException e) {
        	this.onClose("DISCONNECTED");
        	this.onError(e);
        } catch(Exception e) {
        	this.onError(e);
        }
    }

    public void connect(boolean hard) {
        try {
        	if(hard) {
        		this.disconnect(hard);
        	}
        	
        	this.socket	= new Socket(this.hostname, this.port);
        	this.output	= this.socket.getOutputStream();
        	this.input	= this.socket.getInputStream();
        	
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
        	if(this.socket != null && !this.socket.isClosed()) {
        		this.send(new Disconnect());
        	}
        	
        	/* Close all Frames */
    		if(hard) {
    			WindowManager.closeAll();
    		}
    		
            if(this.input != null) {
            	this.socket.shutdownInput();
            	this.input.close();
            }
            
            if(this.output != null) {
            	this.socket.shutdownOutput();
            	this.output.close();
            }
            
            if(this.socket != null) {            	
            	if(!this.socket.isClosed()) {
            		this.socket.close();
            	}
            	
            	this.socket = null;
            }
        } catch(IOException e) {
        	this.onError(e);
        }
    }
    
    public boolean isConnected() {
    	if(this.socket == null) {
			return false;
		}
		
		if(this.socket.isClosed()) {
			return false;
		}
				
		if(this.socket.isConnected()) {
			return true;
		}
		
		return false;
    }

    @Override
    public void run() {
        this.connect(false);

        while(true) {
            try {
                if(input != null) {
                	byte[] lengthBytes = input.readNBytes(4);
                	
                    if(lengthBytes.length < 4) {
                    	continue;
                    }
                    
                    int length			= ByteBuffer.wrap(lengthBytes).getInt();
                    byte[] dataBytes	= input.readNBytes(length);
                    
                    if(dataBytes.length < length) {
                       continue;
                    }

                    String response = new String(dataBytes, StandardCharsets.UTF_8);

                    if(response != null) {
                    	Packet packet	= objects.readValue(response, Packet.class);
            			String json		= objects.writer().withDefaultPrettyPrinter().writeValueAsString(packet.data);
                    	
            			this.onReceive(packet, json, response);
                    }
                }
            } catch (IOException e) {
            	this.onError(e);
            }
        }
    }
    
    protected void onConnected() {
		this.login.setConnected();
		
    	WindowManager.setConnected();
    	
		// Reset Ping
    	//this.ping.shutdownNow();
    	
		System.out.println("Connected...");
    	
    	// Send Handshake
        this.send(new Handshake(this.Client, this.Version));
    }
    
    protected void onClose(String error) {
    	// Reset Ping
    	this.ping.shutdownNow();
    	
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
    	Window window;
    	
    	System.err.println("[RECEIVE] " + packet.operation + ", " + json);
    	
    	switch(packet.operation) {
    		case "CONFIGURATION":
    			Configuration config	= objects.readerFor(Configuration.class).readValue(json);
    			
    			this.login.showLoginButton();
    			this.login.setSuggestion(config.Suggestion);
    			this.login.setStyle(config.Style);
    			
    			// Create Ping
    			//this.ping.shutdownNow();
    			this.ping.scheduleAtFixedRate(new Runnable() {
					@Override
					public void run() {
						send(new Ping());
					}
    			}, 0, 10, TimeUnit.SECONDS);
    		break;
    		case "PING":
    			send(new Pong());
    		break;
    		case "PONG":
    			// @ToDo
    		break;
    		case "ROOMS_CATEGORIES":
    			List<Category> categories	= objects.readValue(json, objects.getTypeFactory().constructCollectionType(List.class, Category.class));
    			
    			this.login.clearCategories();
    			this.login.addCategory(new Category(0, "Alle Chaträume"));
    			
    			for(Category category : categories) {
    				this.login.addCategory(category);
    			}
    		break;
    		case "ROOMS":
    			List<Room> rooms	= objects.readValue(json, objects.getTypeFactory().constructCollectionType(List.class, Room.class));
    			
    			this.login.clearChatrooms();
    			
    			for(Room room : rooms) {
    				this.login.addChatroom(room);
    			}
    			
    			this.login.update();
   			break;
    		case "WINDOW_ROOM":
    			Protocol.Window data	= objects.readerFor(Protocol.Window.class).readValue(json);
    			
    			Window frame = WindowManager.create(this, data.name, data.width, data.height);
				frame.setTitle(data.title);
				frame.update(data.room, data.ranks);
				
				frame.clearUsers();
				
				for(User user : data.getRoom().getUsers()) {
					frame.addUser(user);
				}
				
				frame.requestFocus();
   			break;
    		case "ROOM_UPDATE":
    			RoomUpdate update	= objects.readerFor(RoomUpdate.class).readValue(json);
    			
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
    			RoomUserAdd user	= objects.readerFor(RoomUserAdd.class).readValue(json);
    			
    			window = WindowManager.get(user.getRoom());
    			
    			if(window != null) {
    				window.addUser(user.getUser());
    			}
    		break;
    		case "ROOM_USER_REMOVE":
				RoomUserRemove user2	= objects.readerFor(RoomUserRemove.class).readValue(json);
    			
				window = WindowManager.get(user2.getRoom());
    			
    			if(window != null) {
    				window.removeUser(user2.getUser());
    			}
    		break;
    		case "MESSAGE_PUBLIC":
    			MessagePublic publicMessage		= objects.readerFor(MessagePublic.class).readValue(json);
    			String room3					= null;
    			
    			if(publicMessage.getRoom() != null) {
    				room3 = publicMessage.getRoom();
					
					if(room3.equals("-")) {
						room3 = null;
					}
				}
    			
    			if(room3 == null) {
    				// @ToDo
    				/*WindowManager.getAll().forEach((frame) => {
						frame.addMessage('private', packet.data);
					});*/
    			} else {
	    			window = WindowManager.get(room3);
	    			
	    			if(window != null) {
	    				window.addPublicMessage(publicMessage.getSender(), publicMessage.getText());
	    			}
    			}
    		break;
    		case "MESSAGE_PRIVATE":
    			MessagePrivate privateMessage	= objects.readerFor(MessagePrivate.class).readValue(json);
    			String room						= null;
    			
    			if(privateMessage.getRoom() != null) {
					room = privateMessage.getRoom();
					
					if(room.equals("-")) {
						room = null;
					}
				}
    			
    			if(room == null) {
    				// @ToDo
    				/*WindowManager.getAll().forEach((frame) => {
						frame.addMessage('private', packet.data);
					});*/
    			} else {
	    			window = WindowManager.get(room);
	    			
	    			if(window != null) {
	    				window.addPrivateMessage(privateMessage.getSender(), privateMessage.getUsers(), privateMessage.getText());
	    			}
    			}
    		break;
    		case "MESSAGE_ACTION":
    			MessageAction actionMessage		= objects.readerFor(MessageAction.class).readValue(json);
    			String room2					= null;
    			
    			if(actionMessage.getRoom() != null) {
					room2 = actionMessage.getRoom();
					
					if(room2.equals("-")) {
						room2 = null;
					}
				}
    			
    			if(room2 == null) {
    				// @ToDo
    				/*WindowManager.getAll().forEach((frame) => {
						frame.addMessage('private', packet.data);
					});*/
    			} else {
	    			window = WindowManager.get(room2);
	    			
	    			if(window != null) {
	    				window.addActionMessage(actionMessage.getText());
	    			}
    			}
    		break;
    		case "POPUP":
    			final JOptionPane optionPane	= new JOptionPane(((String) packet.data), JOptionPane.QUESTION_MESSAGE, JOptionPane.CLOSED_OPTION);
    			final JDialog dialog			= new JDialog();
    			
    			optionPane.addPropertyChangeListener(new PropertyChangeListener() {
    				public void propertyChange(PropertyChangeEvent e) {
    					if(dialog.isVisible() && (e.getSource() == optionPane) && (e.getPropertyName().equals(JOptionPane.VALUE_PROPERTY))) {
    						dialog.dispose();
    					}
    				}
    			});
    			
    			dialog.setDefaultCloseOperation(JDialog.DISPOSE_ON_CLOSE);
    			dialog.setTitle("POPUP");
    			dialog.setContentPane(optionPane);
    			dialog.pack();
    			dialog.setVisible(true);
    		break;
    		default:
    			System.err.println("[RECEIVE] Unknown Operation: " + packet.operation + ", " + json);
    		break;
    	}
    }
}