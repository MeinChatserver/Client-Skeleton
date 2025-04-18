# Java Client

### DEV-Environment
We had using `Eclipse IDE` and `Java JDK 24` for development.

You can install [Eclipse from here](https://www.eclipse.org/downloads/download.php?file=/oomph/epp/2025-03/R/eclipse-inst-jre-win64.exe) and [JDK as Installer](https://download.oracle.com/java/24/latest/jdk-24_windows-x64_bin.exe), [JDK as ZIP](https://download.oracle.com/java/24/latest/jdk-24_windows-x64_bin.zip). On installation, you must select the package `Eclipse IDE for Java Developers`.

The project using `Maven` as Build-Tool.

# Example
```bash
usage: Client.jar [Options]
 -d,--hostname <arg>   Hostname, Domain oder IP-Adresse zu dem verbunden
                       werden soll.
 -h,--help             Zeigt diese Hilfe an.
 -p,--port <arg>       Port des Servers zu dem verbunden werden soll.
 -s,--settings <bol>   Deaktiviert die Einstellungen um nachträglich den
                       Server zu ändern (0/1, true/false oder on/off).
```
```bash
java -jar Client.jar --host demo.mein-chatserver.de --port 2710 --settings false
```

# Screenshot
![Client](https://raw.githubusercontent.com/MeinChatserver/Documentation/refs/heads/main/FAQ%20Screenshots/JavaClient.png)
