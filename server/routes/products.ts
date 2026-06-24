import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, productsTable } from "../db";
import {
  GetProductsResponse, GetProductResponse, CreateProductBody,
  UpdateProductBody, UpdateProductParams, GetProductParams, DeleteProductParams,
} from "../../shared/src";
import { requireAuth } from "../middlewares/requireAuth";
import { parseNum } from "../lib/coerce";

const router: IRouter = Router();

const toProduct = (p: typeof productsTable.$inferSelect) => ({
  ...p,
  price: parseNum(p.price),
  cost: parseNum(p.cost),
  createdAt: p.createdAt.toISOString(),
});

router.get("/products", requireAuth, async (req, res): Promise<void> => {
  const products = await db.select().from(productsTable).orderBy(productsTable.name);
  res.json(GetProductsResponse.parse(products.map(toProduct)));
});

router.post("/products", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [product] = await db.insert(productsTable).values({
    ...parsed.data,
    price: String(parsed.data.price),
    cost: String(parsed.data.cost ?? 0),
  }).returning();
  res.status(201).json(GetProductResponse.parse(toProduct(product)));
});

router.get("/products/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, params.data.id));
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }
  res.json(GetProductResponse.parse(toProduct(product)));
});

router.patch("/products/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateProductParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.price != null) updateData.price = String(parsed.data.price);
  if (parsed.data.cost != null) updateData.cost = String(parsed.data.cost);
  const [product] = await db.update(productsTable).set(updateData).where(eq(productsTable.id, params.data.id)).returning();
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }
  res.json(GetProductResponse.parse(toProduct(product)));
});

router.delete("/products/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteProductParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.update(productsTable).set({ active: false }).where(eq(productsTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
