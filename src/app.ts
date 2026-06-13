import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { healthRouter } from "./routes/health.routes.js";
import {
  batchesRouter,
  requisitionsRouter,
} from "./routes/requisitions.routes.js";
import { hrRouter } from "./routes/hr.routes.js";
import { errorHandler } from "./middleware/error-handler.js";

export function createApp(): express.Application {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/health", healthRouter);
  app.use("/api/requisitions", requisitionsRouter);
  app.use("/api/batches", batchesRouter);
  app.use("/api/hr", hrRouter);

  app.use(errorHandler);

  return app;
}

export function startServer(): void {
  const app = createApp();
  app.listen(config.port, () => {
    console.log(
      `Job Posting Automation Plugin listening on http://localhost:${config.port}`
    );
  });
}
