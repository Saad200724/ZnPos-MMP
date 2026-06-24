import { Router, type IRouter } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db, purchasesTable, purchaseItemsTable, productsTable } from "../db";
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
  const { supplierId, supplierName, total, status, notes, items } = parsed.data;

  const poNumber = `PO-${Date.now()}`;
  const [purchase] = await db.insert(purchasesTable).values({
    poNumber,
    supplierId: supplierId ?? null,
    supplierName: supplierName ?? "",
    total: String(total),
    status: status ?? "pending",
    notes: notes ?? null,
  }).returning();

  if (items && items.length > 0) {
    await db.insert(purchaseItemsTable).values(
      items.map(item => ({
        purchaseId: purchase.id,
        productId: item.productId ?? null,
        productName: item.productName,
        qty: item.qty,
        cost: String(item.cost),
        lineTotal: String(item.lineTotal),
      }))
    );

    for (const item of items) {
      if (item.productId) {
        await db.update(productsTable)
          .set({ stock: sql`${productsTable.stock} + ${item.qty}` })
          .where(eq(productsTable.id, item.productId));
      }
    }
  }

  res.status(201).json(toPurchase(purchase));
});

export default router;
