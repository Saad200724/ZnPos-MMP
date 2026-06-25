import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true },
  originalPrice: { type: Number, default: 0 },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", default: null },
  image: { type: String, default: "" },
  images: [String],
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  stockStatus: { type: String, default: "In Stock" },
  stockQuantity: { type: Number, default: 0 },
  tags: [String],
  features: [String],
  isNewProduct: { type: Boolean, default: false },
  isBestseller: { type: Boolean, default: false },
  isOnSale: { type: Boolean, default: false },
  discount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Product = mongoose.model("Product", productSchema);
