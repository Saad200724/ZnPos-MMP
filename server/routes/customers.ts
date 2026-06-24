import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, customersTable } from "../db";
import {
  GetCustomersResponse, GetCustomerResponse, CreateCustomerBody,
  UpdateCustomerBody, UpdateCustomerParams, GetCustomerParams, DeleteCustomerParams,
} from "../../shared/src";
import { requireAuth } from "../middlewares/requireAuth";
import { parseNum } from "../lib/coerce";

const router: IRouter = Router();

const toCustomer = (c: typeof customersTable.$inferSelect) => ({
  id: c.id,
  name: c.name,
  phone: c.phone,
  email: c.email,
  area: c.area,
  group: c.group,
  balance: parseNum(c.balance),
  totalPurchases: parseNum(c.totalPurchases),
  visits: c.visits,
  status: c.status,
  createdAt: c.createdAt.toISOString(),
});

router.get("/customers", requireAuth, async (req, res): Promise<void> => {
  const customers = await db.select().from(customersTable).orderBy(customersTable.name);
  res.json(GetCustomersResponse.parse(customers.map(toCustomer)));
});

router.post("/customers", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateCustomerBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const insertData: any = { ...parsed.data };
  if (parsed.data.balance != null) insertData.balance = String(parsed.data.balance);
  const [customer] = await db.insert(customersTable).values(insertData).returning();
  res.status(201).json(GetCustomerResponse.parse(toCustomer(customer)));
});

router.get("/customers/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetCustomerParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const [customer] = await db.select().from(customersTable).where(eq(customersTable.id, params.data.id));
  if (!customer) { res.status(404).json({ error: "Customer not found" }); return; }
  res.json(GetCustomerResponse.parse(toCustomer(customer)));
});

router.patch("/customers/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateCustomerParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdateCustomerBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.balance != null) updateData.balance = String(parsed.data.balance);
  const [customer] = await db.update(customersTable).set(updateData).where(eq(customersTable.id, params.data.id)).returning();
  if (!customer) { res.status(404).json({ error: "Customer not found" }); return; }
  res.json(GetCustomerResponse.parse(toCustomer(customer)));
});

router.delete("/customers/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteCustomerParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.update(customersTable).set({ status: "Inactive" }).where(eq(customersTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
