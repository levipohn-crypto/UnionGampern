/* ============================================================
   Union Gampern – Firebase-Datenschicht
   - Verwendet Firestore als gemeinsames Backend.
   - Fällt automatisch auf localStorage zurück, solange firebase-config.js
     noch Platzhalter enthält.
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getFirestore,
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  runTransaction,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const config = window.UNION_FIREBASE_CONFIG || {};
const firebaseAktiv = Boolean(
  config.apiKey &&
  config.projectId &&
  !String(config.apiKey).includes("DEINE") &&
  !String(config.projectId).includes("DEIN_") &&
  !String(config.projectId).includes("DEIN")
);

let app = null;
let db = null;
let auth = null;

if (firebaseAktiv) {
  app = initializeApp(config);
  db = getFirestore(app);
  auth = getAuth(app);
}

const settingsRef = () => doc(db, "settings", "main");
const eventsCol = () => collection(db, "events");
const eventRef = (eventId) => doc(db, "events", eventId);
const schichtenCol = (eventId) => collection(db, "events", eventId, "schichten");
const schichtRef = (eventId, schichtId) => doc(db, "events", eventId, "schichten", schichtId);
const anmeldungenCol = (eventId) => collection(db, "events", eventId, "anmeldungen");
const anmeldungRef = (eventId, anmeldungId) => doc(db, "events", eventId, "anmeldungen", anmeldungId);

export function isFirebaseReady() {
  return firebaseAktiv;
}

export function getCurrentUser() {
  return auth?.currentUser || null;
}

export function onAdminStateChanged(callback) {
  if (!firebaseAktiv) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export async function signInAdmin(email, password) {
  if (!firebaseAktiv) throw new Error("Firebase ist noch nicht konfiguriert.");
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signOutAdmin() {
  if (!firebaseAktiv) return;
  return signOut(auth);
}

function localLoadData() {
  return window.loadData();
}

function localSaveData(data) {
  window.saveData(data);
}

function normalizeIdPart(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "person";
}

function signupDocId(schichtId, name) {
  return `${normalizeIdPart(schichtId)}__${normalizeIdPart(name)}`;
}

function prepareEventForFirestore(event) {
  return {
    name: event.name || "",
    datum: event.datum || "",
    ort: event.ort || "",
    beschreibung: event.beschreibung || "",
    sichtbarkeit: event.sichtbarkeit || "oeffentlich",
    zugangscode: event.zugangscode || null,
    spielerliste: Array.isArray(event.spielerliste) ? event.spielerliste : [],
    updatedAt: serverTimestamp(),
  };
}

function prepareSchichtForFirestore(schicht, index) {
  return {
    bereich: schicht.bereich || "",
    start: schicht.start || "",
    ende: schicht.ende || "",
    benoetigt: Number(schicht.benoetigt || 1),
    belegt: Array.isArray(schicht.helfer) ? schicht.helfer.length : Number(schicht.belegt || 0),
    sort: Number.isFinite(schicht.sort) ? schicht.sort : index,
    updatedAt: serverTimestamp(),
  };
}

async function deleteCollectionDocs(refs, batch) {
  const snap = await getDocs(refs);
  snap.forEach((d) => batch.delete(d.ref));
}

async function deleteEventDeep(eventId, batch) {
  await deleteCollectionDocs(schichtenCol(eventId), batch);
  await deleteCollectionDocs(anmeldungenCol(eventId), batch);
  batch.delete(eventRef(eventId));
}

export async function loadData() {
  if (!firebaseAktiv) return localLoadData();

  const settingsSnap = await getDoc(settingsRef());
  const vereinName = settingsSnap.exists() && settingsSnap.data().vereinName
    ? settingsSnap.data().vereinName
    : "Union Gampern";

  const eventsSnap = await getDocs(query(eventsCol(), orderBy("datum")));
  const events = await Promise.all(eventsSnap.docs.map(async (eventDoc) => {
    const eventData = eventDoc.data();
    const eventId = eventDoc.id;

    const [schichtenSnap, anmeldungenSnap] = await Promise.all([
      getDocs(query(schichtenCol(eventId), orderBy("sort"))),
      getDocs(anmeldungenCol(eventId)),
    ]);

    const anmeldungen = anmeldungenSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const schichten = schichtenSnap.docs.map((sDoc) => {
      const s = sDoc.data();
      return {
        id: sDoc.id,
        bereich: s.bereich || "",
        start: s.start || "",
        ende: s.ende || "",
        benoetigt: Number(s.benoetigt || 1),
        belegt: Number(s.belegt || 0),
        sort: Number(s.sort || 0),
        helfer: anmeldungen
          .filter((a) => a.schichtId === sDoc.id)
          .map((a) => ({ id: a.id, name: a.name || "" })),
      };
    });

    return {
      id: eventId,
      name: eventData.name || "",
      datum: eventData.datum || "",
      ort: eventData.ort || "",
      beschreibung: eventData.beschreibung || "",
      sichtbarkeit: eventData.sichtbarkeit || "oeffentlich",
      zugangscode: eventData.zugangscode || null,
      spielerliste: Array.isArray(eventData.spielerliste) ? eventData.spielerliste : [],
      schichten,
    };
  }));

  return { vereinName, events };
}

export async function saveData(data) {
  if (!firebaseAktiv) {
    localSaveData(data);
    return;
  }

  const batch = writeBatch(db);
  batch.set(settingsRef(), {
    vereinName: data.vereinName || "Union Gampern",
    updatedAt: serverTimestamp(),
  }, { merge: true });

  const desiredEventIds = new Set(data.events.map((e) => e.id));
  const currentEventsSnap = await getDocs(eventsCol());

  for (const currentEvent of currentEventsSnap.docs) {
    if (!desiredEventIds.has(currentEvent.id)) {
      await deleteEventDeep(currentEvent.id, batch);
    }
  }

  for (const event of data.events) {
    batch.set(eventRef(event.id), prepareEventForFirestore(event), { merge: true });

    const currentShiftSnap = await getDocs(schichtenCol(event.id));
    const desiredShiftIds = new Set(event.schichten.map((s) => s.id));
    for (const currentShift of currentShiftSnap.docs) {
      if (!desiredShiftIds.has(currentShift.id)) batch.delete(currentShift.ref);
    }

    event.schichten.forEach((schicht, index) => {
      batch.set(schichtRef(event.id, schicht.id), prepareSchichtForFirestore(schicht, index), { merge: true });
    });

    const currentSignupSnap = await getDocs(anmeldungenCol(event.id));
    const desiredSignupIds = new Set();
    event.schichten.forEach((schicht) => {
      (schicht.helfer || []).forEach((helfer) => {
        const id = helfer.id || signupDocId(schicht.id, helfer.name);
        desiredSignupIds.add(id);
        batch.set(anmeldungRef(event.id, id), {
          schichtId: schicht.id,
          name: helfer.name || "",
          createdAt: helfer.createdAt || helfer.zeit || new Date().toISOString(),
        }, { merge: true });
      });
    });
    for (const currentSignup of currentSignupSnap.docs) {
      if (!desiredSignupIds.has(currentSignup.id)) batch.delete(currentSignup.ref);
    }
  }

  await batch.commit();
}

export async function signupForShift(eventId, schichtId, name) {
  if (!firebaseAktiv) {
    const data = localLoadData();
    const event = data.events.find((e) => e.id === eventId);
    const schicht = event?.schichten.find((s) => s.id === schichtId);
    if (!event || !schicht) throw new Error("Event oder Schicht nicht gefunden.");
    if (schicht.helfer.length >= schicht.benoetigt) throw new Error("Diese Schicht ist leider schon voll.");
    if (schicht.helfer.some((h) => h.name.trim().toLowerCase() === name.trim().toLowerCase())) {
      throw new Error("Du bist für diese Schicht bereits eingetragen.");
    }
    schicht.helfer.push({ name });
    localSaveData(data);
    return { data, event, schicht };
  }

  const anmeldungId = signupDocId(schichtId, name);
  const result = await runTransaction(db, async (transaction) => {
    const sRef = schichtRef(eventId, schichtId);
    const aRef = anmeldungRef(eventId, anmeldungId);
    const eRef = eventRef(eventId);

    const [eventSnap, schichtSnap, anmeldungSnap] = await Promise.all([
      transaction.get(eRef),
      transaction.get(sRef),
      transaction.get(aRef),
    ]);

    if (!eventSnap.exists()) throw new Error("Event nicht gefunden.");
    if (!schichtSnap.exists()) throw new Error("Schicht nicht gefunden.");
    if (anmeldungSnap.exists()) throw new Error("Du bist für diese Schicht bereits eingetragen.");

    const eventData = eventSnap.data();
    const schichtData = schichtSnap.data();
    const benoetigt = Number(schichtData.benoetigt || 1);
    const belegt = Number(schichtData.belegt || 0);
    if (belegt >= benoetigt) throw new Error("Diese Schicht ist leider schon voll.");

    transaction.set(aRef, {
      schichtId,
      name,
      createdAt: serverTimestamp(),
    });
    transaction.update(sRef, {
      belegt: belegt + 1,
      updatedAt: serverTimestamp(),
    });
    transaction.set(settingsRef(), {
      vereinName: "Union Gampern",
      updatedAt: serverTimestamp(),
    }, { merge: true });

    return {
      eventName: eventData.name || "",
      schichtBereich: schichtData.bereich || "",
      start: schichtData.start || "",
      ende: schichtData.ende || "",
    };
  });

  const data = await loadData();
  const event = data.events.find((e) => e.id === eventId);
  const schicht = event?.schichten.find((s) => s.id === schichtId);
  return { data, event, schicht, transactionResult: result };
}

export function subscribeData(callback, onError) {
  if (!firebaseAktiv) return () => {};
  return onSnapshot(settingsRef(), async () => {
    try {
      callback(await loadData());
    } catch (error) {
      if (onError) onError(error);
      else console.error(error);
    }
  }, onError || console.error);
}
