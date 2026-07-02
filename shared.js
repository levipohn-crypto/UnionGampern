/* ============================================================
   Vereinszeitmanagement – gemeinsame Demo-Datenschicht (localStorage)
   Wird von admin.html und helfer.html eingebunden.
   ============================================================ */

const STORAGE_KEY = "union_gampern_zeitmanagement_v2";

function seedData() {
  return {
    vereinName: "Union Gampern",
    events: [
      {
        id: "evt-heimspiel-km",
        name: "Heimspiel Kampfmannschaft",
        datum: "2026-08-16",
        ort: "Sportplatz Union Gampern",
        beschreibung: "Helfer für Kassa, Ausschank, Grill und Ordnerdienst beim Heimspiel der Kampfmannschaft.",
        sichtbarkeit: "oeffentlich",
        zugangscode: null,
        spielerliste: [],
        schichten: [
          { id: "s1", bereich: "Aufbau & Platz herrichten", start: "11:00", ende: "13:00", benoetigt: 4,
            helfer: [{ name: "Manuel Gruber" }, { name: "Paul Wagner" }] },
          { id: "s2", bereich: "Kassa Eingang", start: "13:00", ende: "16:30", benoetigt: 2,
            helfer: [{ name: "Lisa Maier" }] },
          { id: "s3", bereich: "Ausschank", start: "13:00", ende: "17:30", benoetigt: 4,
            helfer: [{ name: "Anna Huber" }, { name: "Thomas Berger" }] },
          { id: "s4", bereich: "Grill / Würstelstand", start: "13:30", ende: "17:30", benoetigt: 3,
            helfer: [{ name: "Daniel Aigner" }] },
          { id: "s5", bereich: "Ordnerdienst", start: "13:00", ende: "16:30", benoetigt: 4,
            helfer: [] },
        ],
      },
      {
        id: "evt-nachwuchsturnier",
        name: "Nachwuchsturnier",
        datum: "2026-09-05",
        ort: "Sportplatz Union Gampern",
        beschreibung: "Turniertag für die Nachwuchsmannschaften mit Verpflegung, Spielleitung und Betreuung.",
        sichtbarkeit: "oeffentlich",
        zugangscode: null,
        spielerliste: [],
        schichten: [
          { id: "s6", bereich: "Turnierleitung", start: "08:30", ende: "12:30", benoetigt: 2,
            helfer: [{ name: "Markus Steiner" }] },
          { id: "s7", bereich: "Kuchen & Kaffee", start: "09:00", ende: "13:00", benoetigt: 3,
            helfer: [{ name: "Sophie Lang" }, { name: "Julia Fink" }] },
          { id: "s8", bereich: "Ausschank", start: "12:30", ende: "17:00", benoetigt: 4,
            helfer: [] },
          { id: "s9", bereich: "Abbau", start: "17:00", ende: "18:30", benoetigt: 5,
            helfer: [{ name: "Florian Wimmer" }] },
        ],
      },
      {
        id: "evt-vereinsfest",
        name: "Vereinsfest 1970",
        datum: "2026-10-03",
        ort: "Vereinsheim Union Gampern",
        beschreibung: "Vereinsabend für Mitglieder, Fans und Sponsoren mit Bar, Grill und Musik.",
        sichtbarkeit: "oeffentlich",
        zugangscode: null,
        spielerliste: [],
        schichten: [
          { id: "s10", bereich: "Aufbau Festbereich", start: "10:00", ende: "12:30", benoetigt: 5,
            helfer: [{ name: "Michael Reiter" }, { name: "Karl Brunner" }] },
          { id: "s11", bereich: "Bar", start: "18:00", ende: "22:00", benoetigt: 3,
            helfer: [{ name: "Eva Schmidt" }] },
          { id: "s12", bereich: "Bar", start: "22:00", ende: "02:00", benoetigt: 3,
            helfer: [] },
          { id: "s13", bereich: "Grill", start: "17:30", ende: "21:30", benoetigt: 3,
            helfer: [{ name: "Petra Holzer" }] },
          { id: "s14", bereich: "Abbau & Reinigung", start: "09:00", ende: "11:30", benoetigt: 6,
            helfer: [] },
        ],
      },
      {
        id: "evt-kabinendienst",
        name: "Kabinendienst Kampfmannschaft",
        datum: "2026-08-23",
        ort: "Sportplatz Union Gampern – Kabinentrakt",
        beschreibung: "Interner Kabinen- und Materialdienst. Nur für Personen aus der Kaderliste über privaten Link.",
        sichtbarkeit: "privat",
        zugangscode: uidStable("evt-kabinendienst"),
        spielerliste: [
          "Florian Wimmer", "Daniel Aigner", "Michael Reiter", "Thomas Berger",
          "Markus Steiner", "Paul Wagner", "Manuel Gruber", "Karl Brunner",
        ],
        schichten: [
          { id: "s15", bereich: "Kabinen reinigen", start: "18:00", ende: "19:00", benoetigt: 2,
            helfer: [] },
          { id: "s16", bereich: "Wäsche & Material", start: "18:00", ende: "19:00", benoetigt: 2,
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
