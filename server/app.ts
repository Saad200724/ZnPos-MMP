import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) { return { id: req.id, method: req.method, url: req.url?.split("?")[0] }; },
      res(res) { return { statusCode: res.statusCode }; },
    },
  }),
);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 30 * 24 * 60 * 60,
      touchAfter: 24 * 3600,
    }),
    secret: process.env.SESSION_SECRET ?? "mew-mew-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
    },
  }),
);

app.use("/api", router);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err }, "Unhandled error");
  res.status(500).json({ error: "Internal server error" });
});

export default app;
