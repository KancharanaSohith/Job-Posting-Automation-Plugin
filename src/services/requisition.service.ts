import { RequisitionStatus } from "@prisma/client";
import { config } from "../config.js";
import { prisma } from "../db/client.js";
import {
  assertTransition,
  buildLinkedInGroupKey,
  buildReqId,
} from "../domain/state-machine.js";
import type {
  ConfirmFillInput,
  CreateRequisitionInput,
  DiscussionCompletedInput,
  RejectRequisitionInput,
  UpdateRequisitionInput,
} from "../domain/types.js";
import { EDITABLE_STATUSES } from "../domain/types.js";
import {
  linkedInAdapter,
  notificationAdapter,
  portalAdapter,
} from "../adapters/index.js";
import { logAudit } from "./audit.service.js";
import {
  ensureLinkedInGroup,
  getOpenCountForGroup,
  incrementFilledCount,
  incrementOpenCount,
} from "./linkedin-group.service.js";
import { v4 as uuidv4 } from "uuid";

async function nextSequenceForTeam(teamId: string): Promise<number> {
  const count = await prisma.requisition.count({ where: { teamId } });
  return count + 1;
}

function assertOwner(userId: string, ownerUserId: string): void {
  if (userId !== ownerUserId) {
    throw new Error("Only the owner can perform this action.");
  }
}

async function getRequisitionsByTarget(input: {
  batchId?: string;
  reqId?: string;
}) {
  if (input.reqId) {
    const req = await prisma.requisition.findUnique({ where: { reqId: input.reqId } });
    if (!req) throw new Error(`Requisition not found: ${input.reqId}`);
    return [req];
  }
  if (input.batchId) {
    const reqs = await prisma.requisition.findMany({ where: { batchId: input.batchId } });
    if (reqs.length === 0) throw new Error(`No requisitions for batch: ${input.batchId}`);
    return reqs;
  }
  throw new Error("Either batchId or reqId is required.");
}

export class RequisitionService {
  async createBatch(input: CreateRequisitionInput) {
    const { numberOfOpenings, ...base } = input;
    if (numberOfOpenings < 1 || numberOfOpenings > 50) {
      throw new Error("numberOfOpenings must be between 1 and 50.");
    }

    const batchId = uuidv4();
    const linkedinGroupKey = await ensureLinkedInGroup(
      base.directorId,
      base.roleTitle
    );

    const startSeq = await nextSequenceForTeam(base.teamId);
    const created = [];

    for (let i = 0; i < numberOfOpenings; i++) {
      const reqId = buildReqId(base.teamId, startSeq + i);
      const req = await prisma.requisition.create({
        data: {
          reqId,
          batchId,
          roleTitle: base.roleTitle,
          description: base.description,
          directorId: base.directorId,
          teamId: base.teamId,
          ownerUserId: base.ownerUserId,
          createdByUserId: base.createdByUserId,
          linkedinGroupKey,
          status: RequisitionStatus.Draft,
        },
      });
      created.push(req);

      await logAudit({
        requisitionId: req.id,
        reqId: req.reqId,
        action: "CREATED",
        actorUserId: base.createdByUserId,
        metadata: { batchId, openingIndex: i + 1, totalOpenings: numberOfOpenings },
      });
    }

    return { batchId, requisitions: created };
  }

  async submitForHrReview(batchId: string, ownerUserId: string) {
    const reqs = await prisma.requisition.findMany({ where: { batchId } });
    if (reqs.length === 0) throw new Error(`Batch not found: ${batchId}`);

    assertOwner(ownerUserId, reqs[0].ownerUserId);

    const updated = [];
    for (const req of reqs) {
      if (req.status !== RequisitionStatus.Draft) {
        throw new Error(`Req ${req.reqId} is not in Draft state.`);
      }
      assertTransition(req.status, RequisitionStatus.PendingHR);

      const result = await prisma.requisition.update({
        where: { id: req.id },
        data: { status: RequisitionStatus.PendingHR },
      });
      updated.push(result);

      await logAudit({
        requisitionId: req.id,
        reqId: req.reqId,
        action: "SUBMITTED_FOR_HR",
        actorUserId: ownerUserId,
      });
    }

    await notificationAdapter.send({
      event: "REQ_SUBMITTED",
      title: "New requisitions pending HR review",
      message: `${updated.length} opening(s) submitted for discussion and legal review.`,
      reqIds: updated.map((r) => r.reqId),
      batchId,
    });

    return updated;
  }

  async markDiscussionCompleted(input: DiscussionCompletedInput) {
    if (!input.hrEmail?.includes("@")) {
      throw new Error("Valid HR email is required.");
    }

    const reqs = await getRequisitionsByTarget(input);
    const updated = [];

    for (const req of reqs) {
      if (req.status !== RequisitionStatus.PendingHR) {
        throw new Error(`Req ${req.reqId} is not pending HR review.`);
      }
      assertTransition(req.status, RequisitionStatus.DiscussionCompleted);

      const result = await prisma.requisition.update({
        where: { id: req.id },
        data: {
          status: RequisitionStatus.DiscussionCompleted,
          discussionHrEmail: input.hrEmail,
          discussionCompletedBy: input.hrUserId ?? input.hrEmail,
          discussionCompletedAt: new Date(),
        },
      });
      updated.push(result);

      await logAudit({
        requisitionId: req.id,
        reqId: req.reqId,
        action: "DISCUSSION_COMPLETED",
        actorUserId: input.hrUserId,
        actorEmail: input.hrEmail,
      });
    }

    await notificationAdapter.send({
      event: "REQ_DISCUSSION_COMPLETED",
      title: "Discussion completed — owner may publish",
      message: `HR (${input.hrEmail}) marked discussion and legal review complete.`,
      reqIds: updated.map((r) => r.reqId),
      batchId: updated[0]?.batchId,
    });

    return updated;
  }

  async reject(input: RejectRequisitionInput) {
    const reqs = await getRequisitionsByTarget(input);
    const updated = [];

    for (const req of reqs) {
      if (req.status !== RequisitionStatus.PendingHR) {
        throw new Error(`Req ${req.reqId} cannot be rejected from status ${req.status}.`);
      }
      assertTransition(req.status, RequisitionStatus.Rejected);

      const result = await prisma.requisition.update({
        where: { id: req.id },
        data: {
          status: RequisitionStatus.Rejected,
          rejectionReason: input.reason ?? null,
        },
      });
      updated.push(result);

      await logAudit({
        requisitionId: req.id,
        reqId: req.reqId,
        action: "REJECTED",
        actorUserId: input.hrUserId,
        metadata: { reason: input.reason },
      });
    }

    await notificationAdapter.send({
      event: "REQ_REJECTED",
      title: "Requisitions rejected",
      message: input.reason ?? "Rejected by HR. No resubmit — create a new req if needed.",
      reqIds: updated.map((r) => r.reqId),
      batchId: updated[0]?.batchId,
    });

    return updated;
  }

  async update(reqId: string, ownerUserId: string, input: UpdateRequisitionInput) {
    const req = await prisma.requisition.findUnique({ where: { reqId } });
    if (!req) throw new Error(`Requisition not found: ${reqId}`);

    assertOwner(ownerUserId, req.ownerUserId);

    if (!EDITABLE_STATUSES.includes(req.status)) {
      throw new Error(`Cannot edit req in status ${req.status}.`);
    }

    const updated = await prisma.requisition.update({
      where: { id: req.id },
      data: {
        roleTitle: input.roleTitle ?? req.roleTitle,
        description: input.description ?? req.description,
      },
    });

    await logAudit({
      requisitionId: req.id,
      reqId: req.reqId,
      action: "UPDATED",
      actorUserId: ownerUserId,
    });

    return updated;
  }

  async publish(batchId: string, ownerUserId: string) {
    const reqs = await prisma.requisition.findMany({ where: { batchId } });
    if (reqs.length === 0) throw new Error(`Batch not found: ${batchId}`);

    assertOwner(ownerUserId, reqs[0].ownerUserId);

    const published = [];

    for (const req of reqs) {
      if (req.status !== RequisitionStatus.DiscussionCompleted) {
        throw new Error(`Req ${req.reqId} must be DiscussionCompleted before publish.`);
      }
      assertTransition(req.status, RequisitionStatus.Published);

      const draft = await portalAdapter.createDraft({
        reqId: req.reqId,
        roleTitle: req.roleTitle,
        description: req.description,
        directorId: req.directorId,
        teamId: req.teamId,
      });

      const live = await portalAdapter.publish(draft.portalJobId);

      const result = await prisma.requisition.update({
        where: { id: req.id },
        data: {
          status: RequisitionStatus.Published,
          portalJobId: live.portalJobId,
          portalUrl: live.portalUrl,
          publishedAt: new Date(),
        },
      });
      published.push(result);

      await incrementOpenCount(req.linkedinGroupKey);

      await logAudit({
        requisitionId: req.id,
        reqId: req.reqId,
        action: "PUBLISHED",
        actorUserId: ownerUserId,
        metadata: { portalUrl: live.portalUrl },
      });
    }

    await notificationAdapter.send({
      event: "REQ_PUBLISHED",
      title: "Requisitions live on company portal",
      message: `${published.length} separate portal listing(s) published.`,
      reqIds: published.map((r) => r.reqId),
      batchId,
      metadata: { portalUrls: published.map((r) => r.portalUrl).join(", ") },
    });

    return published;
  }

  async confirmFill(reqId: string, input: ConfirmFillInput) {
    const req = await prisma.requisition.findUnique({ where: { reqId } });
    if (!req) throw new Error(`Requisition not found: ${reqId}`);

    if (req.status !== RequisitionStatus.Published) {
      throw new Error(`Req ${reqId} is not published.`);
    }
    assertTransition(req.status, RequisitionStatus.Filled);

    if (req.portalJobId) {
      await portalAdapter.remove(req.portalJobId);
    }

    const filled = await prisma.requisition.update({
      where: { id: req.id },
      data: {
        status: RequisitionStatus.Filled,
        filledAt: new Date(),
        filledByUserId: input.confirmedByUserId,
        hireName: input.hireName,
      },
    });

    const groupStats = await incrementFilledCount(req.linkedinGroupKey);
    const openRemaining = await getOpenCountForGroup(req.linkedinGroupKey);

    await logAudit({
      requisitionId: req.id,
      reqId: req.reqId,
      action: "FILLED",
      actorUserId: input.confirmedByUserId,
      metadata: { hireName: input.hireName },
    });

    if (openRemaining > 0) {
      await linkedInAdapter.notifyCloseRequired(
        req.linkedinGroupKey,
        groupStats.roleTitle,
        openRemaining
      );
      await notificationAdapter.send({
        event: "REQ_PORTAL_CLOSED_PARTIAL",
        title: "Portal listing closed — LinkedIn remains active",
        message: `${reqId} filled for ${input.hireName}. ${openRemaining} opening(s) still open in this LinkedIn group.`,
        reqIds: [reqId],
        metadata: { openRemaining },
      });
    } else {
      const closeResult = await linkedInAdapter.closePost(
        req.linkedinGroupKey,
        groupStats.linkedinPostId
      );
      await notificationAdapter.send({
        event: "REQ_GROUP_FULLY_CLOSED",
        title: "All openings filled — close LinkedIn",
        message: closeResult.message,
        reqIds: [reqId],
        batchId: req.batchId,
      });
    }

    return filled;
  }

  async cancel(reqId: string, userId: string) {
    const req = await prisma.requisition.findUnique({ where: { reqId } });
    if (!req) throw new Error(`Requisition not found: ${reqId}`);

    if (req.status !== RequisitionStatus.Published) {
      throw new Error(`Only published reqs can be cancelled.`);
    }
    assertTransition(req.status, RequisitionStatus.Cancelled);

    if (req.portalJobId) {
      await portalAdapter.remove(req.portalJobId);
    }

    const cancelled = await prisma.requisition.update({
      where: { id: req.id },
      data: { status: RequisitionStatus.Cancelled },
    });

    await logAudit({
      requisitionId: req.id,
      reqId: req.reqId,
      action: "CANCELLED",
      actorUserId: userId,
    });

    await notificationAdapter.send({
      event: "REQ_CANCELLED",
      title: "Requisition cancelled",
      message: `${reqId} removed from company portal.`,
      reqIds: [reqId],
    });

    return cancelled;
  }

  async supersedeBatch(oldBatchId: string, newBatch: CreateRequisitionInput) {
    const oldReqs = await prisma.requisition.findMany({ where: { batchId: oldBatchId } });
    if (oldReqs.length === 0) throw new Error(`Batch not found: ${oldBatchId}`);

    for (const req of oldReqs) {
      if (
        req.status === RequisitionStatus.Published ||
        req.status === RequisitionStatus.Filled
      ) {
        throw new Error(`Cannot supersede batch with published/filled reqs.`);
      }
      if (
        req.status === RequisitionStatus.Draft ||
        req.status === RequisitionStatus.PendingHR ||
        req.status === RequisitionStatus.DiscussionCompleted
      ) {
        assertTransition(req.status, RequisitionStatus.Superseded);
        await prisma.requisition.update({
          where: { id: req.id },
          data: { status: RequisitionStatus.Superseded },
        });
        await logAudit({
          requisitionId: req.id,
          reqId: req.reqId,
          action: "SUPERSEDED",
          actorUserId: newBatch.createdByUserId,
        });
      }
    }

    const created = await this.createBatch(newBatch);

    await notificationAdapter.send({
      event: "REQ_SUPERSEDED",
      title: "Previous batch superseded",
      message: `New batch ${created.batchId} created; old batch ${oldBatchId} marked superseded.`,
      reqIds: created.requisitions.map((r) => r.reqId),
      batchId: created.batchId,
    });

    return created;
  }

  async getByReqId(reqId: string) {
    const req = await prisma.requisition.findUnique({ where: { reqId } });
    if (!req) throw new Error(`Requisition not found: ${reqId}`);
    return req;
  }

  async getByBatchId(batchId: string) {
    return prisma.requisition.findMany({
      where: { batchId },
      orderBy: { reqId: "asc" },
    });
  }

  async listOpen() {
    return prisma.requisition.findMany({
      where: { status: RequisitionStatus.Published },
      orderBy: { publishedAt: "desc" },
    });
  }

  async listPendingHr() {
    return prisma.requisition.findMany({
      where: { status: RequisitionStatus.PendingHR },
      orderBy: { updatedAt: "desc" },
    });
  }
}

export const requisitionService = new RequisitionService();
