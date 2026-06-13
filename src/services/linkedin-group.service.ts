import { prisma } from "../db/client.js";
import { buildLinkedInGroupKey } from "../domain/state-machine.js";

export async function ensureLinkedInGroup(
  directorId: string,
  roleTitle: string
): Promise<string> {
  const groupKey = buildLinkedInGroupKey(directorId, roleTitle);

  await prisma.linkedInGroup.upsert({
    where: { groupKey },
    create: {
      groupKey,
      directorId,
      roleTitle,
      openCount: 0,
      filledCount: 0,
    },
    update: {},
  });

  return groupKey;
}

export async function incrementOpenCount(groupKey: string, count = 1): Promise<void> {
  await prisma.linkedInGroup.update({
    where: { groupKey },
    data: { openCount: { increment: count } },
  });
}

export async function incrementFilledCount(groupKey: string): Promise<{
  openCount: number;
  filledCount: number;
  roleTitle: string;
  linkedinPostId: string | null;
}> {
  const group = await prisma.linkedInGroup.update({
    where: { groupKey },
    data: { filledCount: { increment: 1 } },
  });

  return {
    openCount: group.openCount,
    filledCount: group.filledCount,
    roleTitle: group.roleTitle,
    linkedinPostId: group.linkedinPostId,
  };
}

export async function getOpenCountForGroup(groupKey: string): Promise<number> {
  const published = await prisma.requisition.count({
    where: {
      linkedinGroupKey: groupKey,
      status: "Published",
    },
  });
  return published;
}
