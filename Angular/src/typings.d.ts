/**
 * Mein Chatserver
 * ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
 * Licensed Materials - Property of mein-chatserver.de.
 * © Copyright 2024. All Rights Reserved.
 *
 * @version 2.0.0
 * @author  Adrian Preuß
 */

/*
* Definiert das Window-Objekt für TypeScript um compiling-Fehler zu vermeiden.
*/
interface Window {
  top:      Window & typeof globalThis;
  self:     Window & typeof globalThis;
  Defaults: any;
}
