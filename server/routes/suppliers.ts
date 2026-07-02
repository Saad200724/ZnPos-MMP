import { Router, type IRouter } from "express";
import { Supplier, nextId } from "../db";
import {
  GetSuppliersResponse, CreateSupplierBody,
  UpdateSupplierBody, UpdateSupplierParams, UpdateSupplierResponse
} from "../../shared/src";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

const toSupplier = (s: any) => ({
  id: s.id,
  name: s.name,
  phone: s.phone ?? null,
  email: s.email ?? null,
  address: s.address ?? null,
  balance: s.balance,
  createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : String(s.createdAt),
});

router.get("/suppliers", requireAuth, async (req, res): Promise<void> => {
  const suppliers = await Supplier.find().sort({ name: 1 });
  res.json(GetSuppliersResponse.parse(suppliers.map(toSupplier)));
});

router.post("/suppliers", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateSupplierBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const id = await nextId("suppliers");
  const supplier = await Supplier.create({ id, ...parsed.data, balance: parsed.data.balance ?? 0 });
  res.status(201).json(UpdateSupplierResponse.parse(toSupplier(supplier)));
});

router.delete("/suppliers/:id", requireAuth, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const supplier = await Supplier.findOne({ id });
  if (!supplier) { res.status(404).json({ error: "Supplier not found" }); return; }
  await Supplier.findOneAndDelete({ id });
  res.sendStatus(204);
});

router.patch("/suppliers/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateSupplierParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdateSupplierBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const supplier = await Supplier.findOneAndUpdate(
    { id: params.data.id },
    { $set: parsed.data },
    { new: true }
  );
  if (!supplier) { res.status(404).json({ error: "Supplier not found" }); return; }
  res.json(UpdateSupplierResponse.parse(toSupplier(supplier)));
});

export default router;
