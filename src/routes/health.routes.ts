import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "job-posting-automation-plugin",
    version: "0.1.0",
  });
});
