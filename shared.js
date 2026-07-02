/* ============================================================
   Helferplaner – gemeinsame Demo-Datenschicht (localStorage)
   Wird von admin.html und helfer.html eingebunden.
   ============================================================ */

const STORAGE_KEY = "helferplaner_demo_v1";

function seedData() {
  return {
    vereinName: "SV Eichenwald",
    events: [
      {
        id: "evt-sommerfest",
        name: "Sommerfest",
        datum: "2026-07-18",
        ort: "Vereinsheim & Festwiese",
        beschreibung: "Unser großes Sommerfest mit Live-Musik, Grillstand und Kinderprogramm.",
        sichtbarkeit: "oeffentlich",
        zugangscode: null,
        spielerliste: [],
        schichten: [
          { id: "s1", bereich: "Grillstand", start: "16:00", ende: "19:00", benoetigt: 3,
            helfer: [{ name: "Manuel Gruber" }, { name: "Sophie Lang" }] },
          { id: "s2", bereich: "Grillstand", start: "19:00", ende: "22:00", benoetigt: 3,
            helfer: [{ name: "Thomas Berger" }] },
          { id: "s3", bereich: "Getränkeausschank", start: "16:00", ende: "20:00", benoetigt: 4,
            helfer: [{ name: "Lisa Maier" }, { name: "Anna Huber" }, { name: "Paul Wagner" }, { name: "Julia Fink" }] },
          { id: "s4", bereich: "Kuchenstand", start: "14:00", ende: "18:00", benoetigt: 2,
            helfer: [] },
          { id: "s5", bereich: "Auf-/Abbau", start: "08:00", ende: "11:00", benoetigt: 5,
            helfer: [{ name: "Markus Steiner" }] },
        ],
      },
      {
        id: "evt-punschstand",
        name: "Punschstand am Adventmarkt",
        datum: "2026-12-05",
        ort: "Hauptplatz",
        beschreibung: "Glühwein- und Punschstand des Vereins beim Adventmarkt.",
        sichtbarkeit: "oeffentlich",
        zugangscode: null,
        spielerliste: [],
        schichten: [
          { id: "s6", bereich: "Ausschank", start: "15:00", ende: "18:00", benoetigt: 2,
            helfer: [{ name: "Eva Schmidt" }, { name: "Karl Brunner" }] },
          { id: "s7", bereich: "Ausschank", start: "18:00", ende: "21:00", benoetigt: 2,
            helfer: [] },
          { id: "s8", bereich: "Kassa", start: "15:00", ende: "21:00", benoetigt: 1,
            helfer: [{ name: "Nina Pichler" }] },
        ],
      },
      {
        id: "evt-heimspiel",
        name: "Heimspiel gegen SV Lindberg",
        datum: "2026-08-02",
        ort: "Sportplatz Nord",
        beschreibung: "Helfer für Kassa, Würstelstand und Ordnerdienst beim Saisonauftakt.",
        sichtbarkeit: "oeffentlich",
        zugangscode: null,
        spielerliste: [],
        schichten: [
          { id: "s9", bereich: "Kassa Eingang", start: "13:00", ende: "16:00", benoetigt: 2,
            helfer: [{ name: "Florian Wimmer" }] },
          { id: "s10", bereich: "Würstelstand", start: "13:30", ende: "17:00", benoetigt: 3,
            helfer: [{ name: "Sarah Koller" }, { name: "Daniel Aigner" }, { name: "Petra Holzer" }] },
          { id: "s11", bereich: "Ordnerdienst", start: "13:00", ende: "16:30", benoetigt: 4,
            helfer: [{ name: "Michael Reiter" }] },
        ],
      },
      {
        id: "evt-kabinendienst",
        name: "Kabinendienst",
        datum: "2026-08-09",
        ort: "Sportplatz Nord – Kabinentrakt",
        beschreibung: "Reinigung und Herrichten der Kabinen nach dem Auswärtsspiel. Nur für Spieler der Kampfmannschaft.",
        sichtbarkeit: "privat",
        zugangscode: uidStable("evt-kabinendienst"),
        spielerliste: [
          "Florian Wimmer", "Daniel Aigner", "Michael Reiter", "Thomas Berger",
          "Markus Steiner", "Paul Wagner", "Manuel Gruber", "Karl Brunner",
        ],
        schichten: [
          { id: "s12", bereich: "Kabine putzen", start: "18:00", ende: "19:00", benoetigt: 2,
            helfer: [] },
          { id: "s13", bereich: "Wäsche & Material", start: "18:00", ende: "19:00", benoetigt: 2,
            helfer: [{ name: "Thomas Berger" }] },
        ],
      },
    ],
  };
}

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = seedData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    const seeded = seedData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function resetData() {
  const seeded = seedData();
  saveData(seeded);
  return seeded;
}

function uid(prefix) {
  return prefix + "-" + Math.random().toString(36).slice(2, 9);
}

// Erzeugt einen zufälligen, aber für die Demo-Seeddaten stabilen Zugangscode,
// damit das Beispiel-Event "Kabinendienst" immer denselben Link behält.
function uidStable(seedKey) {
  const codes = {
    "evt-kabinendienst": "x7f2a91",
  };
  return codes[seedKey] || Math.random().toString(36).slice(2, 9);
}

function neuerZugangscode() {
  return Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 4);
}

// Findet ein privates Event anhand seines Zugangscodes (für Direktlinks).
function findeEventDurchCode(data, code) {
  if (!code) return null;
  return data.events.find((e) => e.sichtbarkeit === "privat" && e.zugangscode === code) || null;
}

// Prüft, ob ein Name in der Spielerliste eines Events steht (case-insensitive, getrimmt).
function istInSpielerliste(event, name) {
  if (!event.spielerliste || event.spielerliste.length === 0) return true; // keine Liste = keine Einschränkung
  const normalized = name.trim().toLowerCase();
  return event.spielerliste.some((s) => s.trim().toLowerCase() === normalized);
}

function formatDatum(isoDatum) {
  const d = new Date(isoDatum + "T00:00:00");
  return d.toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function schichtBelegung(schicht) {
  const belegt = schicht.helfer.length;
  const benoetigt = schicht.benoetigt;
  let status = "offen";
  if (belegt >= benoetigt) status = "voll";
  else if (belegt / benoetigt >= 0.66) status = "fast-voll";
  return { belegt, benoetigt, status };
}

function eventGesamtStatus(event) {
  let belegt = 0, benoetigt = 0;
  event.schichten.forEach((s) => {
    belegt += s.helfer.length;
    benoetigt += s.benoetigt;
  });
  let status = "offen";
  if (benoetigt === 0) status = "offen";
  else if (belegt >= benoetigt) status = "voll";
  else if (belegt / benoetigt >= 0.66) status = "fast-voll";
  return { belegt, benoetigt, status };
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function csvEscape(value) {
  const s = String(value ?? "");
  if (/[",\n;]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function exportEventAsCsv(event) {
  const rows = [["Event", "Bereich", "Start", "Ende", "Helfer Name"]];
  event.schichten.forEach((s) => {
    if (s.helfer.length === 0) {
      rows.push([event.name, s.bereich, s.start, s.ende, ""]);
    } else {
      s.helfer.forEach((h) => {
        rows.push([event.name, s.bereich, s.start, s.ende, h.name]);
      });
    }
  });
  const csvContent = rows.map((r) => r.map(csvEscape).join(";")).join("\n");
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Helferliste_${event.name.replace(/[^a-zA-Z0-9äöüÄÖÜß]+/g, "_")}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
