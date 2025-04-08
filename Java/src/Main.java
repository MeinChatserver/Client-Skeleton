/**
 * Mein Chatserver
 * ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
 * Licensed Materials - Property of mein-chatserver.de.
 * © Copyright 2024. All Rights Reserved.
 *
 * @version 1.0.0
 * @author  Adrian Preuß
 */

import javax.swing.UIManager;

import Client.Client;
import Client.UI.Bootstrap;
import jiconfont.swing.IconFontSwing;

public class Main {
	public static void main(String[] args) {
		/* Set Look & Feel */
		try { 
	        UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName()); 
	    } catch(Exception ignored){}

        /* Register Icons */
        IconFontSwing.register(Bootstrap.getIconFont());
        
        /* Start the Client */
		new Client("demo.mein-chatserver.de", 2710);
	}
}
