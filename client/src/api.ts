// client/src/api.js
import axios from "axios";

const API_BASE = import.meta.env.REACT_APP_API_BASE || "http://localhost:5000";

export async function fetchSessionsFromServer() {
  const res = await axios.get(`${API_BASE}/api/sessions`);
  return res.data;
}

export async function syncWithServer(payload) {
  const res = await axios.post(`${API_BASE}/api/sync`, payload);
  return res.data;
}
