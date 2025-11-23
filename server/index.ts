import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import PracticeSession from "./models/practiceSession";

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

/**
 * Sync endpoint: applies client changes respecting conflict detection.
 * Input: {
 *   lastSyncAt: ISO string,
 *   changes: [ { _id, title, content, version, deleted, op } ]
 * }
 */
app.post("/api/sync", async (req, res) => {
  try {
    const { lastSyncAt, changes } = req.body;

    if (!Array.isArray(changes)) {
      return res.status(400).json({ error: "Invalid changes array" });
    }

    const conflicts = [];
    const applied = [];

    for (const change of changes) {
      const { _id, title, content, version, deleted, op } = change;

      // Defensive checks: skip invalid ops
      if (!["create", "update", "delete"].includes(op)) {
        continue;
      }
      if (op !== "create" && !_id) {
        // Update/delete without ID is invalid, skip
        continue;
      }

      let doc = _id ? await PracticeSession.findById(_id) : null;

      // Handle CREATE operation
      if (op === "create") {
        if (doc) {
          // Document exists already, treat as update below
        } else {
          const created = await PracticeSession.create({
            title,
            content,
            deleted: !!deleted,
            version: 1,
          });
          applied.push(created.toObject());
          continue;
        }
      }

      // Handle UPDATE/DELETE operation
      if (!doc) {
        // No existing doc but client sends update/delete - create afresh
        const created = await PracticeSession.create({
          title,
          content,
          deleted: !!deleted,
          version: 1,
        });
        applied.push(created.toObject());
        continue;
      }

      // Conflict detection: server has newer version
      if (doc.version > version) {
        conflicts.push({
          server: doc.toObject(),
          client: change,
        });
        continue;
      }

      // No conflict: apply changes and increment version
      if (op === "delete") {
        doc.deleted = true;
      } else {
        if (title !== undefined) doc.title = title;
        if (content !== undefined) doc.content = content;
        if (deleted !== undefined) doc.deleted = deleted;
      }
      doc.version += 1;
      await doc.save();
      applied.push(doc.toObject());
    }

    // Fetch server updates after client's lastSyncAt to merge changes
    let updatedSince = [];
    if (lastSyncAt) {
      updatedSince = await PracticeSession.find({
        updatedAt: { $gt: new Date(lastSyncAt) },
      })
        .lean()
        .exec();
    } else {
      updatedSince = await PracticeSession.find().lean().exec();
    }

    res.status(200).json({
      applied,
      conflicts,
      updatedSince,
    });
  } catch (error) {
    console.error("Sync error:", error);
    res.status(500).json({ error: "Sync failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
