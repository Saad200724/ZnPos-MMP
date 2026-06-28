import { Router, type IRouter } from "express";
import { z } from "zod";
import { Quotation, nextId } from "../db";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

const toQuotation = (q: any) => ({
  id: q.id, quotationNo: q.quotationNo, customerId: q.customerId ?? null,
  customerName: q.customerName,
  items: (q.items ?? []).map((i: any) => ({
    productId: i.productId ?? null, productName: i.productName,
    sku: i.sku, price: i.price, qty: i.qty, lineTotal: i.lineTotal,
  })),
  subtotal: q.subtotal, discountAmt: q.discountAmt, tax: q.tax, total: q.total,
  validUntil: q.validUntil ? (q.validUntil instanceof Date ? q.validUntil.toISOString() : String(q.validUntil)) : null,
  status: q.status, notes: q.notes ?? null,
  createdAt: q.createdAt instanceof Date ? q.createdAt.toISOString() : String(q.createdAt),
});

function genQuotationNo(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `QT-${date}-${rand}`;
}

const ItemSchema = z.object({
  productId: z.number().optional().nullable(), productName: z.string(),
  sku: z.string().default(""), price: z.number(), qty: z.number(), lineTotal: z.number(),
});
const CreateBody = z.object({
  customerId: z.number().optional().nullable(), customerName: z.string().default("Walk-in Customer"),
  items: z.array(ItemSchema).min(1), subtotal: z.number(), discountAmt: z.number().default(0),
  tax: z.number().default(0), total: z.number(), validUntil: z.string().optional().nullable(),
  status: z.string().default("Draft"), notes: z.string().optional().nullable(),
});
const UpdateBody = CreateBody.partial();

router.get("/quotations", requireAuth, async (req, res): Promise<void> => {
  const quotations = await Quotation.find().sort({ createdAt: -1 }).limit(200);
  res.json(quotations.map(toQuotation));
});

router.post("/quotations", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const id = await nextId("quotations");
  const quotationNo = genQuotationNo();
  const quotation = await Quotation.create({ id, quotationNo, createdBy: req.session.userId ?? null, ...parsed.data });
  res.status(201).json(toQuotation(quotation));
});

router.patch("/quotations/:id", requireAuth, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdateBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const q = await Quotation.findOneAndUpdate({ id }, { $set: { ...parsed.data, updatedAt: new Date() } }, { new: true });
  if (!q) { res.status(404).json({ error: "Quotation not found" }); return; }
  res.json(toQuotation(q));
});

router.delete("/quotations/:id", requireAuth, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await Quotation.findOneAndDelete({ id });
  res.sendStatus(204);
});

export default router;
