import { RequisitionStatus } from "@prisma/client";

export type { RequisitionStatus };

export interface CreateRequisitionInput {
  roleTitle: string;
  description: string;
  directorId: string;
  teamId: string;
  ownerUserId: string;
  createdByUserId: string;
  numberOfOpenings: number;
}

export interface UpdateRequisitionInput {
  roleTitle?: string;
  description?: string;
}

export interface DiscussionCompletedInput {
  hrEmail: string;
  hrUserId?: string;
  batchId?: string;
  reqId?: string;
}

export interface RejectRequisitionInput {
  reason?: string;
  hrUserId?: string;
  batchId?: string;
  reqId?: string;
}

export interface ConfirmFillInput {
  hireName: string;
  confirmedByUserId: string;
}

export interface ActorContext {
  userId: string;
  email?: string;
  role: "owner" | "delegate" | "hr" | "system";
}

export const TERMINAL_STATUSES: RequisitionStatus[] = [
  RequisitionStatus.Rejected,
  RequisitionStatus.Filled,
  RequisitionStatus.Cancelled,
  RequisitionStatus.Archived,
];

export const EDITABLE_STATUSES: RequisitionStatus[] = [
  RequisitionStatus.Draft,
  RequisitionStatus.PendingHR,
  RequisitionStatus.DiscussionCompleted,
];
