"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotes = exports.deleteNote = exports.syncNotes = exports.updateNote = exports.createNote = void 0;
const notes_model_1 = require("../models/notes.model");
const createNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const note = req.body;
        let newNote = new notes_model_1.default(note);
        // newNote = note;
        console.log(newNote);
        yield newNote.save();
        res.status(200).json({ message: "Success", result: newNote });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
});
exports.createNote = createNote;
const updateNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id } = req.body;
        const data = req.body;
        const updatedNote = yield notes_model_1.default.findByIdAndUpdate(_id, data, { new: true });
        if (!updatedNote) {
            return res.status(404).json({ message: "Note not found" });
        }
        res.status(200).json({ message: "Success", result: updatedNote });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
});
exports.updateNote = updateNote;
const deleteNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedNote = yield notes_model_1.default.findByIdAndDelete(id);
        if (!deletedNote) {
            return res.status(404).json({ message: "Note not found" });
        }
        res.status(200).json({ message: "Note deleted successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
});
exports.deleteNote = deleteNote;
const syncNotes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        if (!Array.isArray(data)) {
            return res.status(400).json({ error: "Invalid changes array" });
        }
        const conflicts = [];
        const applied = [];
        for (const item of data) {
            try {
                const note = yield notes_model_1.default.findOne({ _id: item._id });
                if (item.ops === "delete" && note) {
                    yield notes_model_1.default.findByIdAndDelete(item._id);
                }
                if (!note && ["create", "update"].includes(item.ops)) {
                    const newNote = new notes_model_1.default(item.changes);
                    yield newNote.save();
                }
                if (note && item.ops === "update") {
                    yield notes_model_1.default.findByIdAndUpdate(item._id, item.changes);
                }
                applied.push(item._id);
            }
            catch (err) {
                conflicts.push(item._id);
            }
        }
        res.status(200).json({
            applied,
            conflicts
        });
    }
    catch (err) {
        console.log(err);
    }
});
exports.syncNotes = syncNotes;
const getNotes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notes = yield notes_model_1.default.find().lean();
        res.status(200).json(notes);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch sessions" });
    }
});
exports.getNotes = getNotes;
