import dotenv from "dotenv";

dotenv.config();

function envBool(key: string, defaultValue: boolean): boolean {
  const val = process.env[key];
  if (val === undefined) return defaultValue;
  return val === "true" || val === "1";
}

function envInt(key: string, defaultValue: number): number {
  const val = process.env[key];
  if (!val) return defaultValue;
  const parsed = parseInt(val, 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

export const config = {
  port: envInt("PORT", 3000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  databaseUrl: process.env.DATABASE_URL ?? "file:./data/job-posting.db",
  org: {
    requireHrApproval: envBool("ORG_REQUIRE_HR_APPROVAL", true),
    archiveDraftDays: envInt("ORG_ARCHIVE_DRAFT_DAYS", 30),
  },
  portal: {
    adapter: process.env.PORTAL_ADAPTER ?? "mock",
    baseUrl: process.env.PORTAL_BASE_URL ?? "https://careers.example.com",
  },
  notifications: {
    adapter: process.env.NOTIFICATION_ADAPTER ?? "console",
    channelId: process.env.NOTIFICATION_CHANNEL_ID ?? "",
  },
  linkedin: {
    adapter: process.env.LINKEDIN_ADAPTER ?? "manual",
    clientId: process.env.LINKEDIN_CLIENT_ID ?? "",
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET ?? "",
  },
  teams: {
    appId: process.env.TEAMS_APP_ID ?? "",
    appPassword: process.env.TEAMS_APP_PASSWORD ?? "",
  },
} as const;
