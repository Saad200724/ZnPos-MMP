import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: "cashier" },
  branch: { type: String, default: "Main Branch" },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model("User", userSchema);
