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

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.List;
import com.fasterxml.jackson.databind.ObjectMapper;
import Protocol.Category;
import Protocol.Configuration;
import Protocol.Handshake;
import Protocol.IPacket;
import Protocol.Packet;
import Protocol.Room;

public class Client implements Runnable {
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
        
        new Thread(this).start();
    }

    public void send(IPacket clazz) {
        if(output != null) {
            try {
            	Packet packet = new Packet(clazz.getOperation(), clazz);
            	System.out.println(packet.toString());
            	
	            ObjectMapper mapper	= new ObjectMapper();
	            byte[] dataBytes	= mapper.writeValueAsBytes(packet);
	            byte[] lengthBytes	= ByteBuffer.allocate(4).putInt(dataBytes.length).array();

            	System.out.println("[SEND] " + new String(dataBytes));
            
	            output.write(lengthBytes);
	            output.write(dataBytes);
	            output.flush();
            } catch(Exception e) {
            	 System.err.println("[Error] Can't send: " + e.getMessage());
            }            	
        } else {
            System.err.println("[Error] not connected to server.");
        }
    }

    public void connect() {
        try {
            this.disconnect();

            socket	= new Socket(this.hostname, port);
            output	= socket.getOutputStream();
            input	= socket.getInputStream();

            // Send Handshake
            this.send(new Handshake(this.Client, this.Version));
        } catch (IOException e) {
            System.err.println("[Error] " + e.getMessage());
        }
    }

    public void disconnect() {
        try {
            if(input != null) {
            	input.close();
            }
            
            if(output != null) {
            	output.close();
            }
            
            if(socket != null && !socket.isClosed()) {
            	socket.close();
            }
        } catch (IOException e) {
            System.err.println("[Error] " + e.getMessage());
        }
    }

    @Override
    public void run() {
        this.connect();

        while(true) {
            try {
                if(input != null) {
                	byte[] lengthBytes = input.readNBytes(4);
                	
                    if(lengthBytes.length < 4) {
                        return;
                    }
                    
                    int length			= ByteBuffer.wrap(lengthBytes).getInt();
                    byte[] dataBytes	= input.readNBytes(length);
                    
                    if(dataBytes.length < length) {
                        return;
                    }

                    String response = new String(dataBytes, StandardCharsets.UTF_8);

                    if(response != null) {
                    	Packet packet	= objects.readValue(response, Packet.class);
            			String json		= objects.writer().withDefaultPrettyPrinter().writeValueAsString(packet.data);
                    	
                    	switch(packet.operation) {
                    		case "CONFIGURATION":
                    			Configuration config	= objects.readerFor(Configuration.class).readValue(json);
                    			
                    			System.out.println("ID: " + config.ID);
                    			System.out.println("Suggestion: " + config.Suggestion);
                    		break;
                    		case "ROOMS_CATEGORIES":
                    			List<Category> categories	= objects.readValue(json, objects.getTypeFactory().constructCollectionType(List.class, Category.class));
                    			System.out.println(categories);
                   			break;
                    		case "ROOMS":
                    			List<Room> rooms	= objects.readValue(json, objects.getTypeFactory().constructCollectionType(List.class, Room.class));
                    			System.out.println(rooms);
                   			break;
                    		default:
                    			System.err.println("[RECEIVE] " + response);
                    		break;
                    	}
                    }
                }
            } catch (IOException e) {
                System.err.println("[Error] " + e.toString());
                e.printStackTrace();
            }
        }
    }
}