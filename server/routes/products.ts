import { Router, type IRouter } from "express";
import { Product, nextId } from "../db";
import {
  GetProductsResponse, GetProductResponse, CreateProductBody,
  UpdateProductBody, UpdateProductParams, GetProductParams, DeleteProductParams,
} from "../../shared/src";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

const toProduct = (p: any) => ({
  id: p.id,
  sku: p.sku,
  name: p.name,
  brand: p.brand,
  category: p.category,
  price: p.price,
  cost: p.cost,
  stock: p.stock,
  minStock: p.minStock,
  unit: p.unit,
  weight: p.weight ?? null,
  active: p.active,
  createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
});

router.get("/products", requireAuth, async (req, res): Promise<void> => {
  const products = await Product.find().sort({ name: 1 });
  res.json(GetProductsResponse.parse(products.map(toProduct)));
});

router.post("/products", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const id = await nextId("products");
  const product = await Product.create({ id, ...parsed.data });
  res.status(201).json(GetProductResponse.parse(toProduct(product)));
});

router.get("/products/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const product = await Product.findOne({ id: params.data.id });
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }
  res.json(GetProductResponse.parse(toProduct(product)));
});

router.patch("/products/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateProductParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const product = await Product.findOneAndUpdate(
    { id: params.data.id },
    { $set: { ...parsed.data, updatedAt: new Date() } },
    { new: true }
  );
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }
  res.json(GetProductResponse.parse(toProduct(product)));
});

router.delete("/products/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteProductParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  await Product.findOneAndUpdate({ id: params.data.id }, { active: false });
  res.sendStatus(204);
});

export default router;
