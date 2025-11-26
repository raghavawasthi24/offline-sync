import axios, { AxiosError } from "axios";
import type { NotesI } from "./types/notes";

const API_BASE = import.meta.env.VITE_APP_BACKEND_URL ?? "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 20000,
});

async function handleRequest<T>(request: Promise<{ data: T }>): Promise<T> {
  try {
    const res = await request;
    return res.data;
  } catch (error) {
    const err = error as AxiosError;
    throw new Error(err.response?.data as string || err.message);
  }
}

export function fetchSessionsFromServer() {
  return handleRequest<NotesI[]>(api.get("/notes"));
}

export async function syncWithServer(payload: unknown) {
  try {
    return await handleRequest(api.post("/syncNotes", payload));
  } catch (error) {
    console.warn("Sync failed. Retrying once...");
    //retry
    return await handleRequest(api.post("/syncNotes", payload));
  }
}

export function createNote(payload: NotesI) {
  return handleRequest<any>(api.post("/create-note", payload));
}

export function updateNote(payload: NotesI) {
  return handleRequest<NotesI>(api.patch("/update-note", payload));
}

export function deleteNote(id: string) {
  return handleRequest(api.delete(`/delete-note/${id}`));
}

