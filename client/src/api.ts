import axios from "axios";

const API_BASE = import.meta.env.REACT_APP_API_BASE || "http://localhost:5000";

export async function fetchSessionsFromServer() {
  const res = await axios.get(`${API_BASE}/api/sessions`);
  return res.data;
}

export async function syncWithServer(payload) {
  const res = await axios.post(`${API_BASE}/api/syncNotes`, payload);
  return res.data;
}

export async function createNote(payload) {
  const res = await axios.post(`${API_BASE}/api/create-note`, payload);
  return res.data;
}

export async function updateNote(payload) {
  const res = await axios.patch(`${API_BASE}/api/update-note`, payload);
  return res.data;
}
