export interface LinkedInCloseResult {
  closed: boolean;
  method: "api" | "manual";
  message: string;
}

export interface LinkedInAdapter {
  notifyCloseRequired(groupKey: string, roleTitle: string, openRemaining: number): Promise<void>;
  closePost(groupKey: string, linkedinPostId?: string | null): Promise<LinkedInCloseResult>;
}
