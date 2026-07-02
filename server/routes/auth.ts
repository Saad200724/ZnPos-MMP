import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { User } from "../db";
import { LoginUserBody, LoginUserResponse, GetMeResponse } from "../../shared/src";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

function getUserId(user: any): number {
  return user.id ?? 0;
}

function getUserName(user: any): string {
  if (user.name) return user.name;
  const parts = [user.firstName, user.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : user.username;
}

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const { username, password } = parsed.data;
  const user = await User.findOne({ username });
  const hash = user?.passwordHash ?? user?.password;
  if (!user || !hash || !(await bcrypt.compare(password, hash))) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }
  const userId = getUserId(user);
  req.session.userId = userId;
  req.session.userObjectId = user._id.toString();
  res.json(LoginUserResponse.parse({
    id: userId,
    username: user.username,
    name: getUserName(user),
    role: user.role ?? "cashier",
    branch: user.branch ?? "Main Branch",
  }));
});

router.post("/auth/change-password", requireAuth, async (req, res): Promise<void> => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
    res.status(400).json({ error: "New password must be at least 6 characters" });
    return;
  }
  const objectId = req.session.userObjectId;
  const user = objectId ? await User.findById(objectId) : await User.findOne({ id: req.session.userId });
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  const hash = user.passwordHash ?? user.password;
  if (!hash || !(await bcrypt.compare(currentPassword, hash))) {
    res.status(401).json({ error: "Current password is incorrect" });
    return;
  }
  const newHash = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(user._id, { $set: { password: newHash, passwordHash: newHash } });
  res.json({ message: "Password changed successfully" });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {});
  res.sendStatus(204);
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const objectId = req.session.userObjectId;
  let user = objectId ? await User.findById(objectId) : null;
  if (!user && req.session.userId) {
    user = await User.findOne({ id: req.session.userId });
  }
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  res.json(GetMeResponse.parse({
    id: getUserId(user),
    username: user.username,
    name: getUserName(user),
    role: user.role ?? "cashier",
    branch: user.branch ?? "Main Branch",
  }));
});

export default router;
