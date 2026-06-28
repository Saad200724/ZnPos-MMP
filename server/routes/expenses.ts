import { Router, type IRouter } from "express";
import { z } from "zod";
import { Expense, nextId } from "../db";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

const toExpense = (e: any) => ({
  id: e.id, title: e.title, category: e.category, amount: e.amount,
  date: e.date instanceof Date ? e.date.toISOString() : String(e.date),
  paymentMethod: e.paymentMethod, reference: e.reference ?? null,
  notes: e.notes ?? null, status: e.status,
  createdAt: e.createdAt instanceof Date ? e.createdAt.toISOString() : String(e.createdAt),
});

const CreateBody = z.object({
  title: z.string().min(1), category: z.string().default("General"),
  amount: z.number().positive(), date: z.string().optional(),
  paymentMethod: z.string().default("Cash"), reference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(), status: z.string().default("Paid"),
});
const UpdateBody = CreateBody.partial();

router.get("/expenses", requireAuth, async (req, res): Promise<void> => {
  const expenses = await Expense.find().sort({ date: -1 }).limit(200);
  res.json(expenses.map(toExpense));
});

router.post("/expenses", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const id = await nextId("expenses");
  const exp = await Expense.create({ id, createdBy: req.session.userId ?? null, ...parsed.data });
  res.status(201).json(toExpense(exp));
});

router.patch("/expenses/:id", requireAuth, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdateBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const exp = await Expense.findOneAndUpdate({ id }, { $set: { ...parsed.data, updatedAt: new Date() } }, { new: true });
  if (!exp) { res.status(404).json({ error: "Expense not found" }); return; }
  res.json(toExpense(exp));
});

router.delete("/expenses/:id", requireAuth, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await Expense.findOneAndDelete({ id });
  res.sendStatus(204);
});

export default router;
