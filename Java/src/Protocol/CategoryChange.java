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

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import Protocol.Helper.IntegerSerializer;

@JsonSerialize(using = IntegerSerializer.class)
public class CategoryChange implements IPacket {
    private int id;

    public CategoryChange(int id) {
		this.id = id;
	}

	@Override
    public String toString() {
		return this.id + "";
    }
	

	@Override
	public String getOperation() {
		return "CATEGORY_CHANGE";
	}
}