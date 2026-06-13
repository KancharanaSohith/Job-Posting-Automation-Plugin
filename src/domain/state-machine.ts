import { createHash } from "crypto";
import { RequisitionStatus } from "@prisma/client";

const TRANSITIONS: Record<RequisitionStatus, RequisitionStatus[]> = {
  [RequisitionStatus.Draft]: [
    RequisitionStatus.PendingHR,
    RequisitionStatus.Superseded,
    RequisitionStatus.Archived,
  ],
  [RequisitionStatus.PendingHR]: [
    RequisitionStatus.DiscussionCompleted,
    RequisitionStatus.Rejected,
  ],
  [RequisitionStatus.DiscussionCompleted]: [RequisitionStatus.Published],
  [RequisitionStatus.Published]: [
    RequisitionStatus.Filled,
    RequisitionStatus.Cancelled,
  ],
  [RequisitionStatus.Filled]: [],
  [RequisitionStatus.Rejected]: [],
  [RequisitionStatus.Cancelled]: [],
  [RequisitionStatus.Superseded]: [RequisitionStatus.Archived],
  [RequisitionStatus.Archived]: [],
};

export function canTransition(
  from: RequisitionStatus,
  to: RequisitionStatus
): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTransition(
  from: RequisitionStatus,
  to: RequisitionStatus
): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid state transition: ${from} → ${to}`);
  }
}

export function normalizeRoleTitle(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, " ");
}

export function buildLinkedInGroupKey(
  directorId: string,
  roleTitle: string
): string {
  const normalized = normalizeRoleTitle(roleTitle);
  return createHash("sha256")
    .update(`${directorId}:${normalized}`)
    .digest("hex")
    .slice(0, 16);
}

export function buildReqId(
  teamId: string,
  sequence: number,
  year = new Date().getFullYear()
): string {
  const teamSlug = teamId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 8);
  const seq = String(sequence).padStart(3, "0");
  return `REQ-${year}-${teamSlug}-${seq}`;
}
