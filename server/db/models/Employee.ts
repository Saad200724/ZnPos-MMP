import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, default: null },
  email: { type: String, default: null },
  role: { type: String, default: "Staff" },
  department: { type: String, default: "General" },
  salary: { type: Number, default: 0 },
  joiningDate: { type: Date, default: Date.now },
  address: { type: String, default: null },
  nid: { type: String, default: null },
  status: { type: String, default: "Active" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Employee = mongoose.model("Employee", employeeSchema);
