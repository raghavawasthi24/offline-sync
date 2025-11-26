"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const NotesSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true },
    content: { type: String, default: "" },
    version: { type: Number, default: 1 },
    deleted: { type: Boolean, default: false },
}, { timestamps: true });
const NotesModel = mongoose_1.default.model("NotesModel", NotesSchema);
exports.default = NotesModel;
