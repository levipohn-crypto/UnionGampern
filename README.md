Union Gampern – Vereinszeitmanagement mit Firebase-Backend
Diese Version ist keine reine localStorage-Demo mehr. Sobald du deine Firebase-Konfiguration in `firebase-config.js` einfügst, speichern Helfer- und Adminseite ihre Daten gemeinsam in Firebase Firestore. Dadurch sieht der Admin Eintragungen von anderen Handys.
Dateien
`index.html` – Startseite
`helfer.html` – öffentliche Helfer-Eintragung
`admin.html` – Admin-Bereich mit Firebase-Login
`shared.css` – Design im Union-Gampern-Stil
`shared.js` – gemeinsame Hilfsfunktionen und lokale Demo-Daten
`firebase-config.js` – hier kommt deine Firebase-Web-App-Konfiguration hinein
`firebase-service.js` – Verbindung zu Firestore und Firebase Auth
`firestore.rules` – Sicherheitsregeln zum Kopieren in Firebase
`union-gampern-logo.png` – Vereinslogo
Warum Firebase?
Firebase ist für diese Art Projekt die simpelste Backend-Variante, weil GitHub Pages statisch bleiben kann und die HTML-Dateien direkt mit Firestore sprechen. Du brauchst keinen eigenen Server, kein Node.js-Hosting und keine Datenbankinstallation.
Setup in Firebase
1. Firebase-Projekt erstellen
Auf die Firebase Console gehen.
Neues Projekt erstellen, z. B. `union-gampern-zeitmanagement`.
Google Analytics kannst du für dieses Projekt deaktivieren.
2. Firestore aktivieren
Im Firebase-Projekt links auf Build → Firestore Database.
Create database klicken.
Standort wählen, am besten Europa.
Im Produktionsmodus starten.
3. Web-App erstellen
In der Projektübersicht auf das Web-Symbol `</>` klicken.
App-Namen eingeben, z. B. `Union Gampern Website`.
Firebase zeigt dir einen Codeblock mit `firebaseConfig`.
Werte daraus in `firebase-config.js` einfügen.
Beispiel:
```js
window.UNION_FIREBASE_CONFIG = {
  apiKey: "...",
  authDomain: "...firebaseapp.com",
  projectId: "...",
  storageBucket: "...firebasestorage.app",
  messagingSenderId: "...",
  appId: "..."
};
```
4. Admin-Login anlegen
Links auf Build → Authentication.
Get started klicken.
Anbieter Email/Password aktivieren.
Unter Users einen Admin-Benutzer anlegen.
`admin.html` öffnen und mit diesem Benutzer einloggen.
Die angezeigte Firebase UID kopieren.
5. Firestore-Regeln einfügen
Links auf Build → Firestore Database → Rules.
Inhalt aus `firestore.rules` hineinkopieren.
`DEINE_ADMIN_UID_HIER_EINFUEGEN` durch deine Firebase UID ersetzen.
Publish klicken.
GitHub Pages
Alle Dateien aus diesem Ordner in dein GitHub-Repository laden.
In GitHub unter Settings → Pages den Branch `main` und den Ordner `/ (root)` auswählen.
Nach kurzer Zeit ist die Website online.
Wichtig
Die Firebase-Konfiguration ist im Frontend sichtbar. Das ist bei Firebase normal; die Sicherheit kommt über die Firestore-Regeln, nicht über versteckte API-Keys. Private Events sind in dieser einfachen Version nur über die Website-Logik versteckt. Für wirklich vertrauliche Daten bräuchte man später strengere Regeln oder eine kleine Cloud Function.
Wenn `firebase-config.js` noch Platzhalter enthält, läuft alles automatisch weiter lokal mit `localStorage`. Das ist praktisch zum Testen, aber nicht für echten Mehrgerätebetrieb.
