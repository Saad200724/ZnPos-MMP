import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, default: "General" },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  paymentMethod: { type: String, default: "Cash" },
  reference: { type: String, default: null },
  notes: { type: String, default: null },
  status: { type: String, default: "Paid" },
  createdBy: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Expense = mongoose.model("Expense", expenseSchema);
