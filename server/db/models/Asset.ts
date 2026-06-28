import mongoose from "mongoose";

const assetSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, default: "Equipment" },
  purchaseDate: { type: Date, default: Date.now },
  purchasePrice: { type: Number, required: true },
  currentValue: { type: Number, required: true },
  depreciationRate: { type: Number, default: 0 },
  location: { type: String, default: null },
  serialNo: { type: String, default: null },
  condition: { type: String, default: "Good" },
  notes: { type: String, default: null },
  status: { type: String, default: "Active" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Asset = mongoose.model("Asset", assetSchema);
