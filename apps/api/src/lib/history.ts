import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { quotas } from "./rateLimit";

/** Stores a history entry and trims the user's oldest entries beyond the per-user cap. */
export async function saveHistoryEntry(data: Prisma.TextEntryUncheckedCreateInput) {
  await prisma.textEntry.create({ data });

  const oldestKept = await prisma.textEntry.findMany({
    where: { userId: data.userId },
    orderBy: { createdAt: "desc" },
    skip: quotas.maxHistoryEntries - 1,
    take: 1,
    select: { createdAt: true }
  });
  if (oldestKept[0]) {
    await prisma.textEntry.deleteMany({
      where: { userId: data.userId, createdAt: { lt: oldestKept[0].createdAt } }
    });
  }
}
