import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, purchasesTable } from "../db";
import {
  GetPurchasesResponse, CreatePurchaseBody,
} from "../../shared/src";
import { requireAuth } from "../middlewares/requireAuth";
import { parseNum } from "../lib/coerce";

const router: IRouter = Router();

const toPurchase = (p: typeof purchasesTable.$inferSelect) => ({
  ...p,
  total: parseNum(p.total),
  createdAt: p.createdAt.toISOString(),
});

router.get("/purchases", requireAuth, async (req, res): Promise<void> => {
  const purchases = await db.select().from(purchasesTable).orderBy(desc(purchasesTable.createdAt));
  res.json(GetPurchasesResponse.parse(purchases.map(toPurchase)));
});

router.post("/purchases", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreatePurchaseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const poNumber = `PO-${Date.now()}`;
  const [purchase] = await db.insert(purchasesTable).values({
    poNumber,
    supplierId: parsed.data.supplierId ?? null,
    supplierName: parsed.data.supplierName ?? "",
    total: String(parsed.data.total),
    status: parsed.data.status ?? "pending",
    notes: parsed.data.notes ?? null,
  }).returning();
  res.status(201).json(toPurchase(purchase));
});

export default router;
