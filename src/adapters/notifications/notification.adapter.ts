export type NotificationEvent =
  | "REQ_SUBMITTED"
  | "REQ_DISCUSSION_COMPLETED"
  | "REQ_PUBLISHED"
  | "REQ_REJECTED"
  | "REQ_PORTAL_CLOSED_PARTIAL"
  | "REQ_GROUP_FULLY_CLOSED"
  | "REQ_CANCELLED"
  | "REQ_SUPERSEDED";

export interface NotificationPayload {
  event: NotificationEvent;
  title: string;
  message: string;
  reqIds?: string[];
  batchId?: string;
  metadata?: Record<string, string | number>;
}

export interface NotificationAdapter {
  send(payload: NotificationPayload): Promise<void>;
}
