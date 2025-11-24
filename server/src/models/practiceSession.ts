import mongoose from "mongoose";

const PracticeSessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, default: "" },
    // version for conflict detection
    version: { type: Number, default: 1 },
    // soft delete support if needed
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const PracticeSession = mongoose.model("PracticeSession", PracticeSessionSchema);

export default PracticeSession;
