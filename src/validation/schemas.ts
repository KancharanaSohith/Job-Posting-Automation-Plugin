import { z } from "zod";

export const createRequisitionSchema = z.object({
  roleTitle: z.string().min(2).max(200),
  description: z.string().min(10).max(10000),
  directorId: z.string().min(1),
  teamId: z.string().min(1),
  ownerUserId: z.string().min(1),
  createdByUserId: z.string().min(1),
  numberOfOpenings: z.number().int().min(1).max(50),
});

export const submitBatchSchema = z.object({
  ownerUserId: z.string().min(1),
});

export const discussionCompletedSchema = z.object({
  hrEmail: z.string().email(),
  hrUserId: z.string().optional(),
  batchId: z.string().uuid().optional(),
  reqId: z.string().optional(),
}).refine((d) => d.batchId || d.reqId, {
  message: "Either batchId or reqId is required",
});

export const rejectSchema = z.object({
  reason: z.string().max(2000).optional(),
  hrUserId: z.string().optional(),
  batchId: z.string().uuid().optional(),
  reqId: z.string().optional(),
}).refine((d) => d.batchId || d.reqId, {
  message: "Either batchId or reqId is required",
});

export const updateRequisitionSchema = z.object({
  ownerUserId: z.string().min(1),
  roleTitle: z.string().min(2).max(200).optional(),
  description: z.string().min(10).max(10000).optional(),
});

export const publishBatchSchema = z.object({
  ownerUserId: z.string().min(1),
});

export const confirmFillSchema = z.object({
  hireName: z.string().min(1).max(200),
  confirmedByUserId: z.string().min(1),
});

export const cancelSchema = z.object({
  userId: z.string().min(1),
});

export const supersedeSchema = createRequisitionSchema;
