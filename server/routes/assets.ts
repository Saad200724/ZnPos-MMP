import { Router, type IRouter } from "express";
import { z } from "zod";
import { Asset, nextId } from "../db";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

const toAsset = (a: any) => ({
  id: a.id, name: a.name, category: a.category,
  purchaseDate: a.purchaseDate instanceof Date ? a.purchaseDate.toISOString() : String(a.purchaseDate),
  purchasePrice: a.purchasePrice, currentValue: a.currentValue,
  depreciationRate: a.depreciationRate, location: a.location ?? null,
  serialNo: a.serialNo ?? null, condition: a.condition,
  notes: a.notes ?? null, status: a.status,
  createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : String(a.createdAt),
});

const CreateBody = z.object({
  name: z.string().min(1), category: z.string().default("Equipment"),
  purchaseDate: z.string().optional(), purchasePrice: z.number().nonnegative(),
  currentValue: z.number().nonnegative(), depreciationRate: z.number().default(0),
  location: z.string().optional().nullable(), serialNo: z.string().optional().nullable(),
  condition: z.string().default("Good"), notes: z.string().optional().nullable(),
  status: z.string().default("Active"),
});
const UpdateBody = CreateBody.partial();

router.get("/assets", requireAuth, async (req, res): Promise<void> => {
  const assets = await Asset.find().sort({ name: 1 });
  res.json(assets.map(toAsset));
});

router.post("/assets", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const id = await nextId("assets");
  const asset = await Asset.create({ id, ...parsed.data });
  res.status(201).json(toAsset(asset));
});

router.patch("/assets/:id", requireAuth, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdateBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const asset = await Asset.findOneAndUpdate({ id }, { $set: { ...parsed.data, updatedAt: new Date() } }, { new: true });
  if (!asset) { res.status(404).json({ error: "Asset not found" }); return; }
  res.json(toAsset(asset));
});

router.delete("/assets/:id", requireAuth, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await Asset.findOneAndUpdate({ id }, { status: "Disposed", updatedAt: new Date() });
  res.sendStatus(204);
});

export default router;
