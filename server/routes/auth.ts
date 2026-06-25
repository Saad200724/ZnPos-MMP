import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { User } from "../db";
import { LoginUserBody, LoginUserResponse, GetMeResponse } from "../../shared/src";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const { username, password } = parsed.data;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }
  req.session.userId = user.id;
  res.json(LoginUserResponse.parse({ id: user.id, username: user.username, name: user.name, role: user.role, branch: user.branch }));
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {});
  res.sendStatus(204);
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const user = await User.findOne({ id: req.session.userId });
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  res.json(GetMeResponse.parse({ id: user.id, username: user.username, name: user.name, role: user.role, branch: user.branch }));
});

export default router;
