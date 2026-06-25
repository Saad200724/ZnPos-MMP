import { Router, type IRouter } from "express";
import { Category, Brand } from "../db";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/categories", requireAuth, async (req, res): Promise<void> => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 }).lean();
  res.json(categories.map((c: any) => ({
    id: c._id.toString(),
    name: c.name,
    slug: c.slug,
    description: c.description ?? "",
    isActive: c.isActive,
    createdAt: (c.createdAt instanceof Date ? c.createdAt : new Date(c.createdAt)).toISOString(),
  })));
});

router.get("/brands", requireAuth, async (req, res): Promise<void> => {
  const brands = await Brand.find({ isActive: true }).sort({ name: 1 }).lean();
  res.json(brands.map((b: any) => ({
    id: b._id.toString(),
    name: b.name,
    slug: b.slug,
    description: b.description ?? "",
    isActive: b.isActive,
    createdAt: (b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt)).toISOString(),
  })));
});

export default router;
