import * as express from "express";
import mongoose from "mongoose";
import * as cors from "cors";
import PracticeSession from "./models/notes.model";

const app = express();

// Middleware
app.use(cors({ origin: "*" })); // refine in production for security
app.use(express.json());

// Basic request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/offline_practice";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

app.use(`/${"api"}`, require("./routes/notes.route"));

// Fetch all non-deleted sessions
app.get("/api/sessions", async (req, res) => {
  try {
    const sessions = await PracticeSession.find({ deleted: false }).lean();
    res.status(200).json(sessions);
  } catch (error) {
    console.error("Fetch sessions error:", error);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
