const DB_NAME = "offlinePracticeDB";
const DB_VERSION = 1;
const CHANGES_STORE = "changes";

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (db.objectStoreNames.contains(CHANGES_STORE)) {
        db.deleteObjectStore(CHANGES_STORE);
      }
      db.createObjectStore(CHANGES_STORE, { keyPath: "_id" });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
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


// queue a change for sync
export async function enqueueChange(data, ops) {
  const db = await openDB();

  // If delete operation
  if (ops === "delete") {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(CHANGES_STORE, "readwrite");
      const store = tx.objectStore(CHANGES_STORE);
      store.delete(data._id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // If no existing change → add new
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CHANGES_STORE, "readwrite");
    const store = tx.objectStore(CHANGES_STORE);
    store.put({ changes: data, ops, _id: data._id });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
