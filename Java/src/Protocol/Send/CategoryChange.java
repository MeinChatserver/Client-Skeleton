/**
 * Mein Chatserver
 * ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
 * Licensed Materials - Property of mein-chatserver.de.
 * © Copyright 2024. All Rights Reserved.
 *
 * @version 1.0.0
 * @author Adrian Preuß
 */

package Protocol.Send;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import Interfaces.IPacket;
import Protocol.Helper.IntegerSerializer;

@JsonSerialize(using = IntegerSerializer.class)
public class CategoryChange implements IPacket {
	private int ID;

	public CategoryChange(int id) {
		this.ID = id;
	}

	@Override
	public String toString() {
		return this.ID + "";
	}

	@Override
	public String getOperation() {
		return "CATEGORY_CHANGE";
	}
}