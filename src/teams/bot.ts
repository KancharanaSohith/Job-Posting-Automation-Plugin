/**
 * Teams integration entry point (MVP stub).
 *
 * Wire this to Microsoft Bot Framework when TEAMS_APP_ID and
 * TEAMS_APP_PASSWORD are configured. The bot delegates all business
 * logic to the REST API in requisition.service.ts.
 */

import { config } from "../config.js";

export interface TeamsMessageContext {
  userId: string;
  userEmail?: string;
  text: string;
  conversationId: string;
}

export class TeamsBotHandler {
  isConfigured(): boolean {
    return Boolean(config.teams.appId && config.teams.appPassword);
  }

  /**
   * Parse simple command messages from Teams channels.
   * Example: "create job" opens an adaptive card (future).
   */
  async handleMessage(ctx: TeamsMessageContext): Promise<string> {
    const text = ctx.text.trim().toLowerCase();

    if (text === "help" || text === "status") {
      return [
        "Job Posting Automation Bot (MVP)",
        "",
        "Use the REST API or Teams adaptive cards to:",
        "• Create requisitions (form with number of openings)",
        "• Submit for HR review",
        "• HR: mark Discussion Completed",
        "• Owner: publish to company portal",
        "• Confirm hire to close portal listing",
        "",
        `API base: http://localhost:${config.port}/api`,
      ].join("\n");
    }

    return (
      "Send `help` for commands. Full Teams adaptive-card UI coming in Phase 2.\n" +
      "For now use POST /api/requisitions to create openings."
    );
  }
}

export const teamsBot = new TeamsBotHandler();
