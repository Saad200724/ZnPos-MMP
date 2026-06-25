import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI must be set.");
}

let connected = false;

export async function connectDB() {
  if (connected) return;
  await mongoose.connect(uri!);
  connected = true;
  console.log("MongoDB connected");
}

export { mongoose };
export * from "./models";
