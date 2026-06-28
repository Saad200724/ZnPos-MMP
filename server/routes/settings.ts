import { Router, type IRouter } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

const settingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed },
  updatedAt: { type: Date, default: Date.now },
});
const Settings = mongoose.models.Settings ?? mongoose.model("Settings", settingsSchema);

const defaults = {
  storeName: "Meow Meow Pet Shop",
  storePhone: "",
  storeEmail: "",
  storeAddress: "",
  currency: "৳",
  currencyCode: "BDT",
  taxRate: 0,
  invoicePrefix: "INV",
  quotationPrefix: "QT",
  lowStockThreshold: 5,
  receiptFooter: "Thank you for shopping with us!",
  enableTax: false,
  timezone: "Asia/Dhaka",
};

router.get("/settings", requireAuth, async (req, res): Promise<void> => {
  const docs = await Settings.find();
  const result: Record<string, any> = { ...defaults };
  for (const doc of docs) result[doc.key] = doc.value;
  res.json(result);
});

router.patch("/settings", requireAuth, async (req, res): Promise<void> => {
  const updates = req.body as Record<string, any>;
  await Promise.all(
    Object.entries(updates).map(([key, value]) =>
      Settings.findOneAndUpdate({ key }, { $set: { value, updatedAt: new Date() } }, { upsert: true, new: true })
    )
  );
  const docs = await Settings.find();
  const result: Record<string, any> = { ...defaults };
  for (const doc of docs) result[doc.key] = doc.value;
  res.json(result);
});

export default router;
