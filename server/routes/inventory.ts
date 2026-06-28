import { Router, type IRouter } from "express";
import { z } from "zod";
import { Product, InventoryAdjustment, nextId } from "../db";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

const toAdj = (a: any) => ({
  id: a.id, productId: a.productId, productName: a.productName, sku: a.sku,
  type: a.type, qtyBefore: a.qtyBefore, qtyChange: a.qtyChange, qtyAfter: a.qtyAfter,
  reason: a.reason ?? null, reference: a.reference ?? null,
  createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : String(a.createdAt),
});

const AdjustBody = z.object({
  productId: z.number(), type: z.enum(["add", "remove", "set"]),
  qtyChange: z.number(), reason: z.string().optional().nullable(),
  reference: z.string().optional().nullable(),
});

router.get("/inventory/adjustments", requireAuth, async (req, res): Promise<void> => {
  const adjs = await InventoryAdjustment.find().sort({ createdAt: -1 }).limit(200);
  res.json(adjs.map(toAdj));
});

router.post("/inventory/adjust", requireAuth, async (req, res): Promise<void> => {
  const parsed = AdjustBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { productId, type, qtyChange, reason, reference } = parsed.data;

  const product = await Product.findOne({ id: productId });
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }

  const qtyBefore = product.stockQuantity ?? 0;
  let qtyAfter: number;
  if (type === "add") qtyAfter = qtyBefore + qtyChange;
  else if (type === "remove") qtyAfter = Math.max(0, qtyBefore - qtyChange);
  else qtyAfter = qtyChange;

  const stockStatus = qtyAfter === 0 ? "Out of Stock" : qtyAfter <= (product.minStockLevel ?? 5) ? "Low Stock" : "In Stock";
  await Product.findOneAndUpdate({ id: productId }, { $set: { stockQuantity: qtyAfter, stockStatus, updatedAt: new Date() } });

  const adjId = await nextId("inventoryAdjustments");
  const adj = await InventoryAdjustment.create({
    id: adjId, productId, productName: product.name, sku: product.sku ?? "",
    type, qtyBefore, qtyChange: type === "set" ? qtyAfter - qtyBefore : qtyChange,
    qtyAfter, reason: reason ?? null, reference: reference ?? null,
    createdBy: (req.session as any).userId ?? null,
  });
  res.status(201).json(toAdj(adj));
});

export default router;
