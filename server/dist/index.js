"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const mongoose_1 = require("mongoose");
const cors = require("cors");
const app = express();
// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/offline_practice";
mongoose_1.default
    .connect(MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
});
app.use(`/${"api"}`, require("./routes/notes.route"));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
