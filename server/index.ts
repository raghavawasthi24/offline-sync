// server/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const PracticeSession = require("./models/PracticeSession");

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/offline_practice";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Mongo error", err));

/**
 * Simple API to get all sessions (for initial load)
 */
app.get("/api/sessions", async (req, res) => {
  try {
    const sessions = await PracticeSession.find({ deleted: false }).lean();
    res.json(sessions);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

/**
 * Sync endpoint
 * Client sends:
 *  - lastSyncAt
 *  - changes: [{ _id, title, content, version, deleted, op }]  // op = "create" | "update" | "delete"
 *
 * Simple conflict rule:
 *  - if serverVersion > client.version => conflict
 *  - else apply client change, increment version
 */
app.post("/api/sync", async (req, res) => {
  try {
    const { lastSyncAt, changes } = req.body;

    const conflicts = [];
    const applied = [];

    for (const change of changes || []) {
      const { _id, title, content, version, deleted, op } = change;

      let doc = _id ? await PracticeSession.findById(_id) : null;

      // CREATE
      if (op === "create") {
        if (doc) {
          // Already exists – treat as update
        } else {
          const created = await PracticeSession.create({
            title,
            content,
            deleted: !!deleted,
            version: 1
          });
          applied.push(created);
          continue;
        }
      }

      // UPDATE / DELETE
      if (!doc) {
        // If no server doc but client thinks it's update: just create with version 1
        const created = await PracticeSession.create({
          title,
          content,
          deleted: !!deleted,
          version: 1
        });
        applied.push(created);
        continue;
      }

      // Conflict detection
      if (doc.version > version) {
        conflicts.push({
          server: doc.toObject(),
          client: change
        });
        continue;
      }

      // No conflict: apply client's change, bump version
      if (op === "delete") {
        doc.deleted = true;
      } else {
        if (title !== undefined) doc.title = title;
        if (content !== undefined) doc.content = content;
        if (deleted !== undefined) doc.deleted = deleted;
      }
      doc.version = doc.version + 1;
      await doc.save();
      applied.push(doc);
    }

    // get server updates after lastSyncAt for merging
    let updatedSince = [];
    if (lastSyncAt) {
      updatedSince = await PracticeSession.find({
        updatedAt: { $gt: new Date(lastSyncAt) }
      }).lean();
    } else {
      updatedSince = await PracticeSession.find().lean();
    }

    res.json({
      applied,
      conflicts,
      updatedSince
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Sync failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
