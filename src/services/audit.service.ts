import { prisma } from "../db/client.js";

export async function logAudit(params: {
  requisitionId?: string;
  reqId?: string;
  action: string;
  actorUserId?: string;
  actorEmail?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await prisma.auditLog.create({
    data: {
      requisitionId: params.requisitionId,
      reqId: params.reqId,
      action: params.action,
      actorUserId: params.actorUserId,
      actorEmail: params.actorEmail,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    },
  });
}
