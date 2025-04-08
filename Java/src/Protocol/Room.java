/**
 * Mein Chatserver
 * ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
 * Licensed Materials - Property of mein-chatserver.de.
 * © Copyright 2024. All Rights Reserved.
 *
 * @version 1.0.0
 * @author  Adrian Preuß
 */

package Protocol;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

public class Room implements IPacket {
	@JsonProperty("id")
    private int id;

    @JsonProperty("name")
    private String name;
    
    @JsonProperty("category")
    private Category category;

    @JsonProperty("style")
    private Style style;
    
    @JsonProperty("users")
    private List<User> users;
    
    public Room() {}

    public Room(int id, String name) {
        this.id = id;
        this.name = name;
    }

    public int getID() {
        return id;
    }

    public void setID(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
    
    public List<User> getUsers() {
    	return this.users;
    }
    
    public Style getStyle() {
    	return this. style;
    }

    @Override
    public String toString() {
        return "[Room ID=" + id + ", Name=\"" + name + "\" ]";
    }

	@Override
	public String getOperation() {
		return "ROOMS";
	}
}