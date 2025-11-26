import * as express from "express";
import { createNote, deleteNote, getNotes, syncNotes, updateNote } from "../controllers/notes.controller";

const router = express.Router();

router.post("/create-note", createNote);
router.patch("/update-note", updateNote);
router.delete("/delete-note/:id", deleteNote);

router.get("/notes", getNotes);
router.post("/syncNotes", syncNotes);

module.exports = router;
