import { Router, type Request, type Response, type NextFunction } from "express";
import { requisitionService } from "../services/requisition.service.js";
import {
  discussionCompletedSchema,
  rejectSchema,
} from "../validation/schemas.js";

export const hrRouter = Router();

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

hrRouter.get(
  "/pending",
  asyncHandler(async (_req, res) => {
    const pending = await requisitionService.listPendingHr();
    res.json(pending);
  })
);

hrRouter.post(
  "/discussion-completed",
  asyncHandler(async (req, res) => {
    const input = discussionCompletedSchema.parse(req.body);
    const updated = await requisitionService.markDiscussionCompleted(input);
    res.json(updated);
  })
);

hrRouter.post(
  "/reject",
  asyncHandler(async (req, res) => {
    const input = rejectSchema.parse(req.body);
    const updated = await requisitionService.reject(input);
    res.json(updated);
  })
);
