import { useEffect, useState } from "react";
import {
  clearChanges,
  deleteChange,
  enqueueChange,
  getAllChanges,
} from "./db";
import { createNote, deleteNote, fetchSessionsFromServer, syncWithServer, updateNote } from "./api";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import SyncStatusBar from "./components/SyncStatusBar";
import { ObjectId } from "bson";
import type { NotesI } from "./types/notes";
import NotesList from "./components/NotesList";
import NotesEditor from "./components/NotesEditor";

function generateLocalId() {
  return new ObjectId().toHexString();
}

function App() {
  const online = useOnlineStatus();

  const [notes, setNotes] = useState<NotesI[]>([]);
  const [selected, setSelected] = useState<NotesI | null>(null);
  const [syncing, setSyncing] = useState<boolean>(false);

  useEffect(() => {
    async function getNotes() {
      const serverNotes: NotesI[] = await fetchSessionsFromServer();
      setNotes(serverNotes);
    }
    getNotes();
  }, []);

  useEffect(() => {
    if (online) {
      syncNow();
    }
  }, [online]);

  async function syncNow() {
    setSyncing(true);
    try {
      const changes = await getAllChanges();
      if (!changes || Object.keys(changes).length == 0) {
        return;
      }
      await syncWithServer(changes);
      await clearChanges();
    } catch (e) {
      console.error("Sync error", e);
    } finally {
      setSyncing(false);
    }
  }

  async function handleCreate() {
    let newSession: NotesI = {
      title: "New Notes",
      content: "",
      _id: generateLocalId()
    };

    if (!online) {
      await enqueueChange(newSession, "create");
    } else {
      newSession = (await createNote(newSession)).result;
    }

    setNotes((prev) => [...prev, newSession]);
    setSelected(newSession);
  }

  async function handleNotesChange(updated: NotesI) {
    if (!online) {
      await enqueueChange(updated, "update");
    } else {
      await updateNote(updated);
    }

    const newNotes = notes.map((note) =>
      note._id === updated._id ? updated : note
    );

    setNotes(newNotes);
  }

  async function handleDelete(data: NotesI) {
    if (!online) {
      await deleteChange(data);
    } else {
      await deleteNote(data._id);
    }

    const newNotes = notes.filter((note) =>
      note._id !== data._id
    );

    setNotes(newNotes);

  }

  return (
    <div className="h-screen flex flex-col">
      <SyncStatusBar online={online} syncing={syncing} />
      <div className="flex flex-1">
        <NotesList
          notes={notes}
          onSelect={setSelected}
          onCreate={handleCreate}
          onDelete={handleDelete}
        />
        <NotesEditor note={selected} onChange={handleNotesChange} />
      </div>
    </div>
  );
}


export default App;
