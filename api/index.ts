import type { Request, Response } from "express";
import app from "../server/app";
import { connectDB } from "../server/db";
import { ensureSeeded } from "../server/db/seed";

let initialized = false;

export default async function handler(req: Request, res: Response) {
  if (!initialized) {
    await connectDB();
    await ensureSeeded();
    initialized = true;
  }
  app(req as any, res as any);
}
