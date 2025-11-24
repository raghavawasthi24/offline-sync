import mongoose from "mongoose";

const NotesSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, default: "" },
    version: { type: Number, default: 1 },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const NotesModel = mongoose.model("NotesModel", NotesSchema);

export default NotesModel;
