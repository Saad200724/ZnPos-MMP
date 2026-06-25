import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", counterSchema);

export async function nextId(collectionName: string): Promise<number> {
  const counter = await Counter.findByIdAndUpdate(
    collectionName,
    { $inc: { seq: 1 } },
    { returnDocument: "after", upsert: true }
  );
  return counter!.seq;
}
