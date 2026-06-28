import { Router, type IRouter } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import { User, nextId } from "../db";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

const toUser = (u: any) => ({
  id: u.id, username: u.username, name: u.name ?? u.username,
  role: u.role ?? "staff", email: u.email ?? null,
  status: u.status ?? "Active",
  createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : String(u.createdAt ?? new Date()),
  lastLogin: u.lastLogin ? (u.lastLogin instanceof Date ? u.lastLogin.toISOString() : String(u.lastLogin)) : null,
});

const CreateBody = z.object({
  username: z.string().min(3), password: z.string().min(6),
  name: z.string().optional(), role: z.string().default("staff"),
  email: z.string().optional().nullable(), status: z.string().default("Active"),
});

const UpdateBody = z.object({
  name: z.string().optional(), role: z.string().optional(),
  email: z.string().optional().nullable(), status: z.string().optional(),
  password: z.string().min(6).optional(),
});

router.get("/users", requireAuth, async (req, res): Promise<void> => {
  const users = await User.find().sort({ username: 1 });
  res.json(users.map(toUser));
});

router.post("/users", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const exists = await User.findOne({ username: parsed.data.username });
  if (exists) { res.status(409).json({ error: "Username already taken" }); return; }
  const id = await nextId("users");
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await User.create({ id, ...parsed.data, password: passwordHash });
  res.status(201).json(toUser(user));
});

router.patch("/users/:id", requireAuth, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdateBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const update: any = { ...parsed.data };
  if (update.password) { update.password = await bcrypt.hash(update.password, 10); }
  const user = await User.findOneAndUpdate({ id }, { $set: update }, { new: true });
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(toUser(user));
});

router.delete("/users/:id", requireAuth, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  if ((req.session as any).userId === id) { res.status(400).json({ error: "Cannot delete yourself" }); return; }
  await User.findOneAndUpdate({ id }, { status: "Inactive" });
  res.sendStatus(204);
});

export default router;
