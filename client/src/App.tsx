// client/src/App.js
import { useEffect, useState } from "react";
import {
  getAllSessions,
  saveSessionLocal,
  deleteSessionLocal,
  enqueueChange,
  getAllChanges,
  clearChanges,
  getLastSyncAt,
  setLastSyncAt
} from "./db";
import { createNote, fetchSessionsFromServer, syncWithServer, updateNote } from "./api";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import SessionList from "./components/SessionList";
import SessionEditor from "./components/SessionEditor";
import SyncStatusBar from "./components/SyncStatusBar";

function generateLocalId() {
  return "local-" + Math.random().toString(36).slice(2);
}

function App() {
  const online = useOnlineStatus();
  const [sessions, setSessions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAtState] = useState(null);

  // // load from IndexedDB first
  // useEffect(() => {
  //   (async () => {
  //     const localSessions = await getAllSessions();
  //     setSessions(localSessions);
  //     const last = await getLastSyncAt();
  //     setLastSyncAtState(last);

  //     // initial server fetch if online & no local data
  //     if (online && (!localSessions || localSessions.length === 0)) {
  //       const serverSessions = await fetchSessionsFromServer();
  //       setSessions(serverSessions);
  //       for (const s of serverSessions) {
  //         await saveSessionLocal(s);
  //       }
  //       const now = new Date().toISOString();
  //       await setLastSyncAt(now);
  //       setLastSyncAtState(now);
  //     }
  //   })();
  // }, [online]);

  useEffect(() => {
    async function getNotes() {
      const serverNotes = await fetchSessionsFromServer();
      setSessions(serverNotes)
    }
    getNotes()
  }, [])

  // auto-sync when we go online
  useEffect(() => {
    if (online) {
      syncNow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [online]);

  async function syncNow() {
    setSyncing(true);
    try {
      // const changes = await getAllChanges();
      // const last = await getLastSyncAt();

      // const payload = {
      //   lastSyncAt: last,
      //   changes: changes.map((c) => c.change)
      // };

      // const result = await syncWithServer(payload);
      // const { applied, updatedSince, conflicts } = result;

      // // Apply server updates locally
      // const all = [...sessions];

      // function upsertLocalSessions(list) {
      //   for (const s of list) {
      //     const idx = all.findIndex((x) => x._id === s._id);
      //     if (s.deleted) {
      //       if (idx !== -1) all.splice(idx, 1);
      //     } else if (idx === -1) {
      //       all.push(s);
      //     } else {
      //       all[idx] = s;
      //     }
      //   }
      // }

      // upsertLocalSessions(applied || []);
      // upsertLocalSessions(updatedSince || []);

      // // save to IndexedDB
      // for (const s of all) {
      //   await saveSessionLocal(s);
      // }

      // // handle conflicts: for now, just log + keep server version
      // if (conflicts && conflicts.length > 0) {
      //   console.warn("Conflicts detected:", conflicts);
      //   // you could add UI to let user choose which version wins
      // }

      // setSessions(all);

      // await clearChanges();
      // const now = new Date().toISOString();
      // await setLastSyncAt(now);
      // setLastSyncAtState(now);
    } catch (e) {
      console.error("Sync error", e);
    } finally {
      setSyncing(false);
    }
  }

  async function handleCreate() {
    let newSession = {
      title: "New Session",
      content: "",
      version: 0,
      deleted: false
    };

    if (!online) {
      newSession._id = generateLocalId();
      // await saveSessionLocal(newSession);
      await enqueueChange({
        change: { ...newSession, op: "create" }
      });
    } else {
      newSession = (await createNote(newSession)).result;
    }
    setSessions((prev) => [...prev, newSession])
    setSelected(newSession);
  }

  async function handleDelete(session) {
    // Soft delete locally
    // const updated = sessions.filter((s) => s._id !== session._id);
    // setSessions(updated);
    // await deleteSessionLocal(session._id);
    // await enqueueChange({
    //   change: { _id: session._id, version: session.version || 0, op: "delete" }
    // });
  }

  async function handleSessionChange(updated) {
    if (!online) {
      await enqueueChange(
        {
          _id: updated._id,
          title: updated.title,
          content: updated.content,
          version: updated.version || 0,
        },
        op: "update"
      );
    } else {
      await updateNote(updated);
    }
  }

  return (
    <div className="h-screen flex flex-col">
      <SyncStatusBar online={online} syncing={syncing} lastSyncAt={lastSyncAt} />
      <div className="flex flex-1">
        <SessionList
          sessions={sessions}
          onSelect={setSelected}
          onCreate={handleCreate}
          onDelete={handleDelete}
        />
        <SessionEditor session={selected} onChange={handleSessionChange} />
      </div>
    </div>
  );
}

export default App;



// online -> do in server
// if go offline ---> do in local
// when back -> call all api and sync to db
//        paused changes until finishes
//        once done, ask to reload
//        on reload , get all data
