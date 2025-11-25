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


const syncNotes = async (req, res) => {
  try {

    const data = req.body;

    if (!Array.isArray(data)) {
      return res.status(400).json({ error: "Invalid changes array" });
    }

    const conflicts = [];
    const applied = [];

    for (const item of data) {
      console.log("ITEM", item)
      const note = await NotesModel.findOne({_id: item._id});

      console.log("NOTE", note)
      if (item.ops === "delete") {
        await NotesModel.deleteOne(item._id);
        console.log("Deleted")
        continue;
      }

      if (!note) {
        const newNote = new NotesModel(item.changes);
        await newNote.save();
        applied.push({ _id: newNote._id, action: "created" });

        console.log("creatyed")
        continue;
      }

      await NotesModel.findByIdAndUpdate(item._id, item.changes);
      console.log("updated")
    }

    console.log("returniung")
    res.status(200).json({
      applied,
      conflicts
    });

  } catch (err) {
    console.log(err)
   }

}

export { createNote, updateNote, syncNotes };



//https://fry99.cc/slim-desi-gf-deepthroat-blowjob-and-fucking/
