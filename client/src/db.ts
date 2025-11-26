import type { NotesI } from "./types/notes";

const DB_NAME = "offlinePracticeDB";
const DB_VERSION = 1;
const CHANGES_STORE = "changes";

function openDB(): Promise<IDBDatabase> {
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

function wrapTx<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function addChange(data: NotesI, ops: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(CHANGES_STORE, "readwrite");
  const store = tx.objectStore(CHANGES_STORE);

  const existing = await wrapTx<any>(store.get(data._id));
  const finalOps = existing?.ops === "create" ? existing.ops : ops;

  store.put({ changes: data, ops: finalOps, _id: data._id });

  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}


export async function deleteChange(data: NotesI): Promise<void> {
  if (!data || !data._id) return;

  // figure out if we already have a queued change for this note
  const changes = await getAllChanges();
  const existing = changes.find(change => change._id === data._id);

  //if the note was queued as create, then create+delete cancels out.
  // so just remove the queued change entirely.
  if (existing?.ops === "create") {
    const db = await openDB();
    const tx = db.transaction(CHANGES_STORE, "readwrite");
    const store = tx.objectStore(CHANGES_STORE);
    store.delete(data._id);

    return new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  // for update or no existing change:
  return addChange(
    { _id: data._id } as NotesI,
    "delete"
  );
}


export async function getAllChanges(): Promise<any[]> {
  const db = await openDB();
  const tx = db.transaction(CHANGES_STORE, "readonly");
  const store = tx.objectStore(CHANGES_STORE);
  return wrapTx(store.getAll());
}

export async function clearChanges(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(CHANGES_STORE, "readwrite");
  const store = tx.objectStore(CHANGES_STORE);
  store.clear();
  return wrapTx(store.getAll()).then(() => undefined);
}

/**
 * Queue a change for sync
 * - "delete": saves a deletion intent
 * - others: upserts note change
 */
export async function enqueueChange(data: NotesI, ops: "create" | "update" | "delete"): Promise<void> {
  if (!data || !data._id) return;

  if (ops === "delete") {
    // Instead of removing the record entirely,
    // we store a delete operation so the server
    // learns about it during sync.
    return addChange({ _id: data._id } as NotesI, "delete");
  }

  return addChange(data, ops);
}
