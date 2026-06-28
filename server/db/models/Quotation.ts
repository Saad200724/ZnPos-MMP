import mongoose from "mongoose";

const quotationItemSchema = new mongoose.Schema(
  {
    productId: { type: Number, default: null },
    productName: { type: String, required: true },
    sku: { type: String, default: "" },
    price: { type: Number, required: true },
    qty: { type: Number, required: true },
    lineTotal: { type: Number, required: true },
  },
  { _id: false }
);

const quotationSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  quotationNo: { type: String, required: true, unique: true },
  customerId: { type: Number, default: null },
  customerName: { type: String, default: "Walk-in Customer" },
  items: [quotationItemSchema],
  subtotal: { type: Number, required: true },
  discountAmt: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  validUntil: { type: Date, default: null },
  status: { type: String, default: "Draft" },
  notes: { type: String, default: null },
  createdBy: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Quotation = mongoose.model("Quotation", quotationSchema);
