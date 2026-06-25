import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  sku: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  cost: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  minStock: { type: Number, default: 5 },
  unit: { type: String, default: "pcs" },
  weight: { type: String, default: null },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Product = mongoose.model("Product", productSchema);
