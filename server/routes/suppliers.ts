import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, suppliersTable } from "../db";
import {
  GetSuppliersResponse, CreateSupplierBody,
  UpdateSupplierBody, UpdateSupplierParams, UpdateSupplierResponse
} from "../../shared/src";
import { requireAuth } from "../middlewares/requireAuth";
import { parseNum } from "../lib/coerce";

const router: IRouter = Router();

const toSupplier = (s: typeof suppliersTable.$inferSelect) => ({
  ...s,
  balance: parseNum(s.balance),
  createdAt: s.createdAt.toISOString(),
});

router.get("/suppliers", requireAuth, async (req, res): Promise<void> => {
  const suppliers = await db.select().from(suppliersTable).orderBy(suppliersTable.name);
  res.json(GetSuppliersResponse.parse(suppliers.map(toSupplier)));
});

router.post("/suppliers", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateSupplierBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [supplier] = await db.insert(suppliersTable).values({
    ...parsed.data,
    balance: String(parsed.data.balance ?? 0),
  }).returning();
  res.status(201).json(UpdateSupplierResponse.parse(toSupplier(supplier)));
});

router.patch("/suppliers/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateSupplierParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdateSupplierBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.balance != null) updateData.balance = String(parsed.data.balance);
  const [supplier] = await db.update(suppliersTable).set(updateData).where(eq(suppliersTable.id, params.data.id)).returning();
  if (!supplier) { res.status(404).json({ error: "Supplier not found" }); return; }
  res.json(UpdateSupplierResponse.parse(toSupplier(supplier)));
});

export default router;
