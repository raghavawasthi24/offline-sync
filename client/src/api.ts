import axios from "axios";
import type { NotesI } from "./types/notes";

const API_BASE = import.meta.env.REACT_APP_API_BASE || "http://localhost:5000";

export async function fetchSessionsFromServer() {
  const res = await axios.get(`${API_BASE}/api/notes`);
  return res.data;
}

export async function syncWithServer(payload: any) {
  const res = await axios.post(`${API_BASE}/api/syncNotes`, payload);
  return res.data;
}

export async function createNote(payload: NotesI) {
  const res = await axios.post(`${API_BASE}/api/create-note`, payload);
  return res.data;
}

export async function updateNote(payload: NotesI) {
  const res = await axios.patch(`${API_BASE}/api/update-note`, payload);
  return res.data;
}

export async function deleteNote(id: string) {
  const res = await axios.delete(`${API_BASE}/api/delete-note/${id}`);
  return res.data;
}
