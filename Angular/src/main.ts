/**
 * Mein Chatserver
 * ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
 * Licensed Materials - Property of mein-chatserver.de.
 * © Copyright 2024. All Rights Reserved.
 *
 * @version 2.0.0
 * @author  Adrian Preuß
 */
import { bootstrapApplication } from '@angular/platform-browser';
import { Client } from './Client';

/*
* Dies ist der Einstiegspunkt des Angular-Clienten.
*/
bootstrapApplication(Client, {
  providers: []
}).catch(error => console.error(error));
