import { connectDB } from "./db";
import { ensureSeeded } from "./db/seed";
import app from "./app";
import { logger } from "./lib/logger";

const port = Number(process.env["PORT"] ?? 3000);

connectDB()
  .then(() => ensureSeeded())
  .then(() => {
    app.listen(port, (err) => {
      if (err) {
        logger.error({ err }, "Error listening on port");
        process.exit(1);
      }
      logger.info({ port }, "Server listening");
    });
  })
  .catch((err) => {
    logger.error({ err }, "Failed to connect to MongoDB");
    process.exit(1);
  });
