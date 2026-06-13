import type {
  NotificationAdapter,
  NotificationPayload,
} from "./notification.adapter.js";

export class ConsoleNotificationAdapter implements NotificationAdapter {
  async send(payload: NotificationPayload): Promise<void> {
    const timestamp = new Date().toISOString();
    console.log(
      `[NOTIFICATION ${timestamp}] ${payload.event}: ${payload.title}\n  ${payload.message}`,
      payload.reqIds ? `\n  Req IDs: ${payload.reqIds.join(", ")}` : "",
      payload.metadata ? `\n  Meta: ${JSON.stringify(payload.metadata)}` : ""
    );
  }
}
