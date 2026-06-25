import mongoose from "mongoose";

const transactionItemSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    productId: { type: Number, default: null },
    productName: { type: String, required: true },
    productBrand: { type: String, default: "" },
    sku: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true },
    lineTotal: { type: Number, required: true },
  },
  { _id: false }
);

const transactionSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  receiptNo: { type: String, required: true, unique: true },
  customerId: { type: Number, default: null },
  customerName: { type: String, default: "Walk-in Customer" },
  userId: { type: Number, default: null },
  subtotal: { type: Number, required: true },
  discountPct: { type: Number, default: 0 },
  discountAmt: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  status: { type: String, default: "completed" },
  notes: { type: String, default: null },
  items: [transactionItemSchema],
  createdAt: { type: Date, default: Date.now },
});

export const Transaction = mongoose.model("Transaction", transactionSchema);
