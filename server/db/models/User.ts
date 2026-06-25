import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  id: { type: Number, default: null },
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, default: null },
  password: { type: String, default: null },
  name: { type: String, default: null },
  firstName: { type: String, default: null },
  lastName: { type: String, default: null },
  email: { type: String, default: null },
  role: { type: String, default: "cashier" },
  branch: { type: String, default: "Main Branch" },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model("User", userSchema);
