import type { LinkedInAdapter, LinkedInCloseResult } from "./linkedin.adapter.js";

export class ManualLinkedInAdapter implements LinkedInAdapter {
  async notifyCloseRequired(
    groupKey: string,
    roleTitle: string,
    openRemaining: number
  ): Promise<void> {
    console.log(
      `[LINKEDIN MANUAL] Group ${groupKey} ("${roleTitle}"): ${openRemaining} opening(s) remain — keep LinkedIn post active.`
    );
  }

  async closePost(
    groupKey: string,
    linkedinPostId?: string | null
  ): Promise<LinkedInCloseResult> {
    console.log(
      `[LINKEDIN MANUAL] All openings closed for group ${groupKey}. HR must close LinkedIn post${linkedinPostId ? ` ${linkedinPostId}` : ""} manually.`
    );
    return {
      closed: false,
      method: "manual",
      message: "HR notified to close LinkedIn post manually.",
    };
  }
}
