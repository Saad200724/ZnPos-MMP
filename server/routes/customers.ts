import { Router, type IRouter } from "express";
import { Customer, nextId } from "../db";
import {
  GetCustomersResponse, GetCustomerResponse, CreateCustomerBody,
  UpdateCustomerBody, UpdateCustomerParams, GetCustomerParams, DeleteCustomerParams,
} from "../../shared/src";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

const toCustomer = (c: any) => ({
  id: c.id,
  name: c.name,
  phone: c.phone ?? null,
  email: c.email ?? null,
  area: c.area ?? null,
  group: c.group,
  balance: c.balance,
  totalPurchases: c.totalPurchases,
  visits: c.visits,
  status: c.status,
  createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : String(c.createdAt),
});

router.get("/customers", requireAuth, async (req, res): Promise<void> => {
  const customers = await Customer.find().sort({ name: 1 });
  res.json(GetCustomersResponse.parse(customers.map(toCustomer)));
});

router.post("/customers", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateCustomerBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const id = await nextId("customers");
  const customer = await Customer.create({ id, ...parsed.data });
  res.status(201).json(GetCustomerResponse.parse(toCustomer(customer)));
});

router.get("/customers/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetCustomerParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const customer = await Customer.findOne({ id: params.data.id });
  if (!customer) { res.status(404).json({ error: "Customer not found" }); return; }
  res.json(GetCustomerResponse.parse(toCustomer(customer)));
});

router.patch("/customers/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateCustomerParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdateCustomerBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const customer = await Customer.findOneAndUpdate(
    { id: params.data.id },
    { $set: { ...parsed.data, updatedAt: new Date() } },
    { new: true }
  );
  if (!customer) { res.status(404).json({ error: "Customer not found" }); return; }
  res.json(GetCustomerResponse.parse(toCustomer(customer)));
});

router.delete("/customers/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteCustomerParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  await Customer.findOneAndUpdate({ id: params.data.id }, { status: "Inactive", updatedAt: new Date() });
  res.sendStatus(204);
});

export default router;
