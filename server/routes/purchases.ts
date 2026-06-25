import { Router, type IRouter } from "express";
import { Purchase, Product, nextId } from "../db";
import {
  GetPurchasesResponse, CreatePurchaseBody,
} from "../../shared/src";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

const toPurchase = (p: any) => ({
  id: p.id,
  poNumber: p.poNumber,
  supplierId: p.supplierId ?? null,
  supplierName: p.supplierName,
  total: p.total,
  status: p.status,
  notes: p.notes ?? null,
  createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
});

router.get("/purchases", requireAuth, async (req, res): Promise<void> => {
  const purchases = await Purchase.find().sort({ createdAt: -1 });
  res.json(GetPurchasesResponse.parse(purchases.map(toPurchase)));
});

router.post("/purchases", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreatePurchaseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { supplierId, supplierName, total, status, notes, items } = parsed.data;

  const id = await nextId("purchases");
  const poNumber = `PO-${Date.now()}`;

  const purchase = await Purchase.create({
    id,
    poNumber,
    supplierId: supplierId ?? null,
    supplierName: supplierName ?? "",
    total,
    status: status ?? "pending",
    notes: notes ?? null,
    items: (items ?? []).map(item => ({
      productId: item.productId ?? null,
      productName: item.productName,
      qty: item.qty,
      cost: item.cost,
      lineTotal: item.lineTotal,
    })),
  });

  if (items && items.length > 0) {
    for (const item of items) {
      if (item.productId) {
        await Product.findOneAndUpdate(
          { id: item.productId },
          { $inc: { stock: item.qty }, $set: { updatedAt: new Date() } }
        );
      }
    }
  }

  res.status(201).json(toPurchase(purchase));
});

export default router;
