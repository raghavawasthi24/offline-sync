import * as express from "express";
import { createNote, updateNote } from "../controllers/notes.controller";

const router = express.Router();

// Routes for user
router.post("/create-note", createNote);
router.patch("/update-note", updateNote);

module.exports = router;
