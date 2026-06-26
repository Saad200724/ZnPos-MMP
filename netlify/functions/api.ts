import serverless from "serverless-http";
import app from "../../server/app";
import { connectDB } from "../../server/db";
import { ensureSeeded } from "../../server/db/seed";

let initialized = false;

const baseHandler = serverless(app as any);

export const handler = async (event: any, context: any) => {
  if (!initialized) {
    await connectDB();
    await ensureSeeded();
    initialized = true;
  }
  return baseHandler(event, context);
};
