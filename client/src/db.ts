// client/src/db.js
const DB_NAME = "offlinePracticeDB";
const DB_VERSION = 1;
const SESSIONS_STORE = "sessions";
const CHANGES_STORE = "changes";
const META_STORE = "meta"; // for lastSyncAt

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(SESSIONS_STORE)) {
        db.createObjectStore(SESSIONS_STORE, { keyPath: "_id" });
      }
      if (!db.objectStoreNames.contains(CHANGES_STORE)) {
        db.createObjectStore(CHANGES_STORE, { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllSessions() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SESSIONS_STORE, "readonly");
    const store = tx.objectStore(SESSIONS_STORE);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveSessionLocal(session) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SESSIONS_STORE, "readwrite");
    const store = tx.objectStore(SESSIONS_STORE);
    store.put(session);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteSessionLocal(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SESSIONS_STORE, "readwrite");
    const store = tx.objectStore(SESSIONS_STORE);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// queue a change for sync
export async function enqueueChange(change) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CHANGES_STORE, "readwrite");
    const store = tx.objectStore(CHANGES_STORE);
    store.add(change);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllChanges() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CHANGES_STORE, "readonly");
    const store = tx.objectStore(CHANGES_STORE);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function clearChanges() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CHANGES_STORE, "readwrite");
    const store = tx.objectStore(CHANGES_STORE);
    store.clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getLastSyncAt() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, "readonly");
    const store = tx.objectStore(META_STORE);
    const req = store.get("lastSyncAt");
    req.onsuccess = () => resolve(req.result ? req.result.value : null);
    req.onerror = () => reject(req.error);
  });
}

export async function setLastSyncAt(value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, "readwrite");
    const store = tx.objectStore(META_STORE);
    store.put({ key: "lastSyncAt", value });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
