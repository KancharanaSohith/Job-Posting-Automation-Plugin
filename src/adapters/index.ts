import { config } from "../config.js";
import type { PortalAdapter } from "./portal/portal.adapter.js";
import { MockPortalAdapter } from "./portal/mock-portal.adapter.js";
import type { NotificationAdapter } from "./notifications/notification.adapter.js";
import { ConsoleNotificationAdapter } from "./notifications/console-notification.adapter.js";
import type { LinkedInAdapter } from "./linkedin/linkedin.adapter.js";
import { ManualLinkedInAdapter } from "./linkedin/manual-linkedin.adapter.js";

export function createPortalAdapter(): PortalAdapter {
  switch (config.portal.adapter) {
    case "mock":
    default:
      return new MockPortalAdapter();
  }
}

export function createNotificationAdapter(): NotificationAdapter {
  switch (config.notifications.adapter) {
    case "console":
    default:
      return new ConsoleNotificationAdapter();
  }
}

export function createLinkedInAdapter(): LinkedInAdapter {
  switch (config.linkedin.adapter) {
    case "manual":
    default:
      return new ManualLinkedInAdapter();
  }
}

export const portalAdapter = createPortalAdapter();
export const notificationAdapter = createNotificationAdapter();
export const linkedInAdapter = createLinkedInAdapter();
