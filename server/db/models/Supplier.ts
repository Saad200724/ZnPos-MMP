import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, default: null },
  email: { type: String, default: null },
  address: { type: String, default: null },
  balance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export const Supplier = mongoose.model("Supplier", supplierSchema);
