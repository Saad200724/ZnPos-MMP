import { Router, type IRouter } from "express";
import { z } from "zod";
import { Employee, nextId } from "../db";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

const toEmployee = (e: any) => ({
  id: e.id, name: e.name, phone: e.phone ?? null, email: e.email ?? null,
  role: e.role, department: e.department, salary: e.salary,
  joiningDate: e.joiningDate instanceof Date ? e.joiningDate.toISOString() : String(e.joiningDate),
  address: e.address ?? null, nid: e.nid ?? null, status: e.status,
  createdAt: e.createdAt instanceof Date ? e.createdAt.toISOString() : String(e.createdAt),
});

const CreateBody = z.object({
  name: z.string().min(1), phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(), role: z.string().default("Staff"),
  department: z.string().default("General"), salary: z.number().default(0),
  joiningDate: z.string().optional(), address: z.string().optional().nullable(),
  nid: z.string().optional().nullable(), status: z.string().default("Active"),
});
const UpdateBody = CreateBody.partial();

router.get("/employees", requireAuth, async (req, res): Promise<void> => {
  const employees = await Employee.find().sort({ name: 1 });
  res.json(employees.map(toEmployee));
});

router.post("/employees", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const id = await nextId("employees");
  const emp = await Employee.create({ id, ...parsed.data });
  res.status(201).json(toEmployee(emp));
});

router.patch("/employees/:id", requireAuth, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdateBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const emp = await Employee.findOneAndUpdate({ id }, { $set: { ...parsed.data, updatedAt: new Date() } }, { new: true });
  if (!emp) { res.status(404).json({ error: "Employee not found" }); return; }
  res.json(toEmployee(emp));
});

router.delete("/employees/:id", requireAuth, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await Employee.findOneAndUpdate({ id }, { status: "Inactive", updatedAt: new Date() });
  res.sendStatus(204);
});

export default router;
