import { RequisitionStatus } from "@prisma/client";
import { config } from "../config.js";
import { prisma } from "../db/client.js";
import { assertTransition } from "../domain/state-machine.js";
import { logAudit } from "./audit.service.js";

export async function archiveStaleRequisitions(): Promise<number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - config.org.archiveDraftDays);

  const stale = await prisma.requisition.findMany({
    where: {
      status: {
        in: [RequisitionStatus.Draft, RequisitionStatus.Superseded],
      },
      updatedAt: { lt: cutoff },
    },
  });

  let archived = 0;
  for (const req of stale) {
    assertTransition(req.status, RequisitionStatus.Archived);
    await prisma.requisition.update({
      where: { id: req.id },
      data: {
        status: RequisitionStatus.Archived,
        archivedAt: new Date(),
      },
    });
    await logAudit({
      requisitionId: req.id,
      reqId: req.reqId,
      action: "ARCHIVED",
      actorUserId: "system",
      metadata: { reason: "retention_policy", days: config.org.archiveDraftDays },
    });
    archived++;
  }

  return archived;
}
