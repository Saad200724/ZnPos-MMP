import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, default: null },
  email: { type: String, default: null },
  area: { type: String, default: null },
  group: { type: String, default: "Regular" },
  balance: { type: Number, default: 0 },
  totalPurchases: { type: Number, default: 0 },
  visits: { type: Number, default: 0 },
  status: { type: String, default: "Active" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Customer = mongoose.model("Customer", customerSchema);
