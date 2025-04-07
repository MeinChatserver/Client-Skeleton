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
import Protocol.Packet;
import Protocol.Room;

public class Client implements Runnable {
	private JFrame window	= new JFrame();
	private Login login		= new Login(this);
    private String Client   = "JavaClient";
    private String Version  = "V1.0";
    private String hostname;
    private int port;
    private Socket socket;
    private OutputStream output;
    private InputStream input;
    private ObjectMapper objects = new ObjectMapper();
    
    public Client(String hostname, int port) {
        this.hostname   = hostname;
        this.port       = port;

        System.out.println("www.mein-chatserver.de - " + this.Client + " " + this.Version + ". Copyright © 2024 by Mein Chatserver. All Rights Reserved.");

        this.window.setTitle("Chat " + this.Client + " (" + this.Version + ")");
        this.window.setContentPane(this.login);
        this.window.setMinimumSize(new Dimension(385, 385));
        this.window.setSize(385, 385);
        this.window.pack();
        this.window.setVisible(true);
        
        new Thread(this).start();
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
            	this.input.close();
            }
            
            if(this.output != null) {
            	this.output.close();
            }
            
            if(this.socket != null) {            	
            	if(!this.socket.isClosed()) {
            		this.socket.close();
            	}
            	
            	this.socket = null;
            }
        } catch (IOException e) {
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
		System.out.println("Connected...");
    	
    	// Send Handshake
        this.send(new Handshake(this.Client, this.Version));
    }
    
    protected void onClose(String error) {
    	// Reset Ping
    	this.disconnect(false);
    	WindowManager.setDisconnected();
		this.login.setDisconnected();
    	
		// create Timeout
		
		System.err.println("Socket: onClose = " + error);
    }
    
    protected void onError(Exception e) {
        System.err.println("[Error] " + e.getMessage());
        e.printStackTrace();    	
    }
    
    protected void onReceive(Packet packet, String json, String response) throws JsonMappingException, JsonProcessingException {
    	switch(packet.operation) {
    		case "CONFIGURATION":
    			Configuration config	= objects.readerFor(Configuration.class).readValue(json);
    			
    			this.login.showLoginButton();
    			this.login.setSuggestion(config.Suggestion);
    			
    			// Create Ping
    			/*this.Ping = setInterval(() => {
						this.send({
							operation: 'PING'
						});
					}, 10000);*/
    		break;
    		case "PING":
    			/*this.send({
						operation:	'PONG'
					});*/
    		break;
    		case "PONG":
    			// @ToDo
    		break;
    		case "ROOMS_CATEGORIES":
    			List<Category> categories	= objects.readValue(json, objects.getTypeFactory().constructCollectionType(List.class, Category.class));
    			System.out.println(categories);
   			
    			// @ToDo
    			
    			/*Login.clearCategories();
					Login.addCategory({ id: 0, name: 'Alle Chaträume' });
					packet.data.forEach(Login.addCategory.bind(Login));*/
    		break;
    		case "ROOMS":
    			List<Room> rooms	= objects.readValue(json, objects.getTypeFactory().constructCollectionType(List.class, Room.class));
    			
    			this.login.clearChatrooms();
    			
    			for(Room room : rooms) {
    				this.login.addChatroom(room.getName());
    			}
    			
    			this.login.update();
   			break;
    		case "WINDOW_ROOM":
    			Protocol.Window window	= objects.readerFor(Protocol.Window.class).readValue(json);
    			
    			Window frame = WindowManager.create(this, window.name, window.width, window.height);
				frame.setTitle(window.title);
				frame.setStyle(window.room, window.ranks);				
				frame.requestFocus();
    			System.out.println(window);
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