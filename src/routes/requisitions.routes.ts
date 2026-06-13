import { Router, type Request, type Response, type NextFunction } from "express";
import { requisitionService } from "../services/requisition.service.js";

function param(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}
import {
  confirmFillSchema,
  createRequisitionSchema,
  publishBatchSchema,
  submitBatchSchema,
  updateRequisitionSchema,
} from "../validation/schemas.js";

export const requisitionsRouter = Router();

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

requisitionsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = createRequisitionSchema.parse(req.body);
    const result = await requisitionService.createBatch(input);
    res.status(201).json(result);
  })
);

requisitionsRouter.get(
  "/open",
  asyncHandler(async (_req, res) => {
    const reqs = await requisitionService.listOpen();
    res.json(reqs);
  })
);

requisitionsRouter.get(
  "/:reqId",
  asyncHandler(async (req, res) => {
    const record = await requisitionService.getByReqId(param(req.params.reqId));
    res.json(record);
  })
);

requisitionsRouter.patch(
  "/:reqId",
  asyncHandler(async (req, res) => {
    const { ownerUserId, ...updates } = updateRequisitionSchema.parse(req.body);
    const record = await requisitionService.update(
      param(req.params.reqId),
      ownerUserId,
      updates
    );
    res.json(record);
  })
);

requisitionsRouter.post(
  "/:reqId/fill",
  asyncHandler(async (req, res) => {
    const input = confirmFillSchema.parse(req.body);
    const record = await requisitionService.confirmFill(param(req.params.reqId), input);
    res.json(record);
  })
);

requisitionsRouter.post(
  "/:reqId/cancel",
  asyncHandler(async (req, res) => {
    const { userId } = req.body as { userId: string };
    if (!userId) {
      res.status(400).json({ error: "userId is required" });
      return;
    }
    const record = await requisitionService.cancel(param(req.params.reqId), userId);
    res.json(record);
  })
);

export const batchesRouter = Router();

batchesRouter.get(
  "/:batchId",
  asyncHandler(async (req, res) => {
    const reqs = await requisitionService.getByBatchId(param(req.params.batchId));
    res.json(reqs);
  })
);

batchesRouter.post(
  "/:batchId/submit",
  asyncHandler(async (req, res) => {
    const { ownerUserId } = submitBatchSchema.parse(req.body);
    const updated = await requisitionService.submitForHrReview(
      param(req.params.batchId),
      ownerUserId
    );
    res.json(updated);
  })
);

batchesRouter.post(
  "/:batchId/publish",
  asyncHandler(async (req, res) => {
    const { ownerUserId } = publishBatchSchema.parse(req.body);
    const published = await requisitionService.publish(
      param(req.params.batchId),
      ownerUserId
    );
    res.json(published);
  })
);

batchesRouter.post(
  "/:batchId/supersede",
  asyncHandler(async (req, res) => {
    const input = createRequisitionSchema.parse(req.body);
    const result = await requisitionService.supersedeBatch(param(req.params.batchId), input);
    res.status(201).json(result);
  })
);
