import mongoose from "mongoose";

const inventoryAdjustmentSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  productId: { type: Number, required: true },
  productName: { type: String, required: true },
  sku: { type: String, default: "" },
  type: { type: String, required: true },
  qtyBefore: { type: Number, required: true },
  qtyChange: { type: Number, required: true },
  qtyAfter: { type: Number, required: true },
  reason: { type: String, default: null },
  reference: { type: String, default: null },
  createdBy: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now },
});

export const InventoryAdjustment = mongoose.model("InventoryAdjustment", inventoryAdjustmentSchema);
