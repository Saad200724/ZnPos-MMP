import { Router, type IRouter } from "express";
import mongoose from "mongoose";
import { Product, Category, Brand } from "../db";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

const toProduct = (p: any, catName?: string, brandName?: string) => ({
  _id: p._id.toString(),
  id: p._id.toString(),
  name: p.name,
  description: p.description ?? "",
  price: p.price,
  originalPrice: p.originalPrice ?? p.price,
  categoryId: p.categoryId?.toString() ?? null,
  categoryName: catName ?? null,
  brandId: p.brandId?.toString() ?? null,
  brandName: brandName ?? null,
  image: p.image ?? "",
  images: p.images ?? [],
  rating: p.rating ?? 0,
  reviews: p.reviews ?? 0,
  stockStatus: p.stockQuantity > 0 ? "In Stock" : "Out of Stock",
  stockQuantity: p.stockQuantity ?? 0,
  stock: p.stockQuantity ?? 0,
  minStock: p.minStock ?? 0,
  tags: p.tags ?? [],
  features: p.features ?? [],
  isNewProduct: p.isNewProduct ?? false,
  isBestseller: p.isBestseller ?? false,
  isOnSale: p.isOnSale ?? false,
  discount: p.discount ?? 0,
  isActive: p.isActive ?? true,
  active: p.isActive ?? true,
  sku: p.sku ?? p._id.toString(),
  unit: p.unit ?? "pcs",
  brand: brandName ?? p.brand ?? "",
  category: catName ?? p.category ?? "",
  cost: p.cost ?? 0,
  createdAt: (p.createdAt instanceof Date ? p.createdAt : new Date(p.createdAt)).toISOString(),
  updatedAt: (p.updatedAt instanceof Date ? p.updatedAt : new Date(p.updatedAt)).toISOString(),
});

async function enrichProducts(products: any[]) {
  const catIds = [...new Set(products.map(p => p.categoryId?.toString()).filter(Boolean))];
  const brandIds = [...new Set(products.map(p => p.brandId?.toString()).filter(Boolean))];
  const [cats, brands] = await Promise.all([
    catIds.length ? Category.find({ _id: { $in: catIds } }).lean() : [],
    brandIds.length ? Brand.find({ _id: { $in: brandIds } }).lean() : [],
  ]);
  const catMap: Record<string, string> = {};
  const brandMap: Record<string, string> = {};
  cats.forEach((c: any) => { catMap[c._id.toString()] = c.name; });
  brands.forEach((b: any) => { brandMap[b._id.toString()] = b.name; });
  return products.map(p => toProduct(
    p,
    p.categoryId ? catMap[p.categoryId.toString()] : undefined,
    p.brandId ? brandMap[p.brandId.toString()] : undefined,
  ));
}

router.get("/products", requireAuth, async (req, res): Promise<void> => {
  const products = await Product.find({ isActive: true }).sort({ name: 1 }).lean();
  const enriched = await enrichProducts(products);
  res.json(enriched);
});

router.post("/products", requireAuth, async (req, res): Promise<void> => {
  const { name, price, stockQuantity, stock, categoryId, brandId, description, image, isActive, isOnSale, discount, originalPrice, tags, unit, sku } = req.body;
  if (!name || price == null) {
    res.status(400).json({ error: "name and price are required" });
    return;
  }
  const qty = stockQuantity ?? stock ?? 0;
  const product = await Product.create({
    name, price,
    originalPrice: originalPrice ?? price,
    description: description ?? "",
    categoryId: categoryId ? new mongoose.Types.ObjectId(categoryId) : null,
    brandId: brandId ? new mongoose.Types.ObjectId(brandId) : null,
    stockQuantity: qty,
    stockStatus: qty > 0 ? "In Stock" : "Out of Stock",
    image: image ?? "",
    isActive: isActive ?? true,
    isOnSale: isOnSale ?? false,
    discount: discount ?? 0,
    tags: tags ?? [],
    unit: unit ?? "pcs",
    sku: sku ?? undefined,
  });
  const [enriched] = await enrichProducts([product.toObject()]);
  res.status(201).json(enriched);
});

router.get("/products/:id", requireAuth, async (req, res): Promise<void> => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const product = await Product.findById(id).lean();
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }
  const [enriched] = await enrichProducts([product]);
  res.json(enriched);
});

router.patch("/products/:id", requireAuth, async (req, res): Promise<void> => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const updates: any = { ...req.body, updatedAt: new Date() };
  if (updates.stock != null && updates.stockQuantity == null) {
    updates.stockQuantity = updates.stock;
    delete updates.stock;
  }
  if (updates.stockQuantity != null) {
    updates.stockStatus = updates.stockQuantity > 0 ? "In Stock" : "Out of Stock";
  }
  if (updates.categoryId) updates.categoryId = new mongoose.Types.ObjectId(updates.categoryId);
  if (updates.brandId) updates.brandId = new mongoose.Types.ObjectId(updates.brandId);
  const product = await Product.findByIdAndUpdate(id, { $set: updates }, { new: true, returnDocument: "after" }).lean();
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }
  const [enriched] = await enrichProducts([product]);
  res.json(enriched);
});

router.delete("/products/:id", requireAuth, async (req, res): Promise<void> => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await Product.findByIdAndUpdate(id, { isActive: false, updatedAt: new Date() });
  res.sendStatus(204);
});

export default router;
