import { Request, Response } from "express";
import NotesModel from "../models/notes.model";

const createNote = async (req: Request, res: Response) => {
  try {
    const note = req.body;

    let newNote = new NotesModel(note);
    // newNote = note;

    console.log(newNote)
    await newNote.save();

    res.status(200).json({ message: "Success", result: newNote });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const updateNote = async (req: Request, res: Response) => {
  try {
    const { _id } = req.body;
    const data = req.body;

    const updatedNote = await NotesModel.findByIdAndUpdate(
      _id,
      data,
      { new: true }
    );

    if (!updatedNote) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json({ message: "Success", result: updatedNote });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const deleteNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedNote = await NotesModel.findByIdAndDelete(id);

    if (!deletedNote) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const syncNotes = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    if (!Array.isArray(data)) {
      return res.status(400).json({ error: "Invalid changes array" });
    }

    const conflicts = [];
    const applied = [];

    for (const item of data) {
      try {
        const note = await NotesModel.findOne({ _id: item._id });

        if (item.ops === "delete" && note) {
          await NotesModel.findByIdAndDelete(item._id);
        }

        if (!note && ["create", "update"].includes(item.ops)) {
          const newNote = new NotesModel(item.changes);
          await newNote.save();
        }

        if (note && item.ops === "update") {
          await NotesModel.findByIdAndUpdate(item._id, item.changes);
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
  } catch (err) {
    console.log(err)
  }
}

const getNotes = async (req: Request, res: Response) => {
  try {
    const notes = await NotesModel.find().lean();
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
};

export { createNote, updateNote, syncNotes, deleteNote, getNotes };
