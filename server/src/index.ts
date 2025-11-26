import * as express from "express";
import mongoose from "mongoose";
import * as cors from "cors";
const app = express();

require("dotenv").config();

app.use(cors({ origin: "*" }));
app.use(express.json());

console.log(process.env.MONGO_URI)

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/offline_practice";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected", MONGO_URI))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

app.use(`/${"api"}`, require("./routes/notes.route"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
