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

export { createNote, updateNote };
