import { prisma } from "@/lib/prisma";

/**
 * Daily cleanup cron job
 * Runs automated cleanup rules based on user settings
 * Example: 0 2 * * * (daily at 2am)
 */
export async function dailyCleanup() {
  console.log("🧹 Starting daily cleanup...");

  const users = await prisma.user.findMany({
    where: {
      googleAccessToken: { not: null },
    },
  });

  let totalCleaned = 0;

  for (const user of users) {
    try {
      const cleaned = await runCleanupForUser(user.id);
      totalCleaned += cleaned;
      console.log(`✅ Cleaned ${cleaned} emails for user ${user.email}`);
    } catch (error) {
      console.error(`❌ Error cleaning for user ${user.email}:`, error);
    }
  }

  console.log(`✅ Daily cleanup complete: ${totalCleaned} emails cleaned`);
  return { cleaned: totalCleaned };
}

async function runCleanupForUser(userId: string) {
  const now = new Date();
  let cleaned = 0;

  // Delete old promotional emails (older than 30 days)
  const oldPromotional = await prisma.email.deleteMany({
    where: {
      userId,
      category: "promotional",
      date: {
        lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });
  cleaned += oldPromotional.count;

  // Delete old newsletters (older than 60 days)
  const oldNewsletters = await prisma.email.deleteMany({
    where: {
      userId,
      category: "newsletter",
      date: {
        lt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
      },
    },
  });
  cleaned += oldNewsletters.count;

  // Delete spam (older than 7 days)
  const oldSpam = await prisma.email.deleteMany({
    where: {
      userId,
      category: "spam",
      date: {
        lt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
    },
  });
  cleaned += oldSpam.count;

  return cleaned;
}

// Removed local runner and duplicate implementation to avoid ESM and type conflicts.
