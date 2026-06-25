import mongoose from "mongoose";

const purchaseItemSchema = new mongoose.Schema(
  {
    productId: { type: Number, default: null },
    productName: { type: String, required: true },
    qty: { type: Number, required: true },
    cost: { type: Number, required: true },
    lineTotal: { type: Number, required: true },
  },
  { _id: false }
);

const purchaseSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  poNumber: { type: String, required: true, unique: true },
  supplierId: { type: Number, default: null },
  supplierName: { type: String, default: "" },
  total: { type: Number, required: true },
  status: { type: String, default: "pending" },
  notes: { type: String, default: null },
  items: [purchaseItemSchema],
  createdAt: { type: Date, default: Date.now },
});

export const Purchase = mongoose.model("Purchase", purchaseSchema);
