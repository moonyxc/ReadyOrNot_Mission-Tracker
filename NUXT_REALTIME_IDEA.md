# Idee: Gemeinsamer Mission-Tracker in Echtzeit

## Kurzbeschreibung

Eine Nuxt-Seite, auf der eine Person eine gemeinsame Mission startet und
auswählt. Die Seite erstellt eine private Sitzung mit einem teilbaren Link.
Freunde öffnen den Link und verfolgen oder aktualisieren den Missionsfortschritt
gemeinsam in Echtzeit.

## Ablauf

1. Eine Person wählt **Mission starten**.
2. Sie wählt die gewünschte Mission aus.
3. Die Seite erstellt eine Sitzung und zeigt einen Einladungslink an.
4. Freunde treten über den Link bei und sehen dieselbe Mission und denselben
   Fortschritt.
5. Änderungen an Zielen und Zählern werden für alle Teilnehmenden live
   synchronisiert.
6. Die Sitzung wird beendet; der gespeicherte Fortschritt bleibt beim Ersteller
   im Local Storage verfügbar.

## Umfang für eine erste Version

- Private Sitzung pro gestarteter Mission mit teilbarem Einladungslink
- Jeder mit dem Einladungslink darf beitreten und den Fortschritt bearbeiten
- Anzeige der verbundenen Teilnehmenden
- Gemeinsames Aktualisieren von Check-Zielen und Zählern
- Wiederherstellung des Sitzungsstands nach einem kurzen Verbindungsabbruch
  eines Teilnehmenden, solange der Ersteller verbunden bleibt
- Bedienbare, responsive Oberfläche für Desktop und Mobilgeräte
- Kein Benutzerkonto erforderlich; Anzeigenamen können optional sein
- Der Fortschritt wird nur im Local Storage des Erstellers dauerhaft
  gespeichert.
- Der Ersteller kann die Sitzung zurücksetzen oder löschen.
- Verlässt der Ersteller die Seite oder verliert die Verbindung, wird die
  Sitzung beendet.

## Missions- und Zählregeln

- Bekannte Suspect- und Civilian-Ziele zeigen ihren festen Gesamtwert.
- Bei unbekannten Gesamtwerten wird `N/?` angezeigt; diese Ziele zählen bis zur
  Festlegung eines Gesamtwerts nicht in den Gesamtfortschritt.
- Normale Evidence wird nicht separat gezählt, sondern gehört zu den Suspects.
  Explizite Missionsziele zum Melden bestimmter Evidence bleiben erhalten.

## Technischer Ansatz

Die Anwendung wird mit Nuxt umgesetzt und nutzt das Nuxt-Modul `nuxt-realtime`
für die Echtzeit-Synchronisierung der Sitzungen. Der Einladungslink dient als
Zugang zur Sitzung und sollte schwer erratbar sein. Der gemeinsame Stand wird
live synchronisiert; dauerhaft gespeichert wird er nur im Local Storage des
Erstellers.

Die konkreten APIs und die Eignung des Moduls für Sitzungsverwaltung,
Persistenz und Wiederverbindung werden vor der Implementierung geprüft.
