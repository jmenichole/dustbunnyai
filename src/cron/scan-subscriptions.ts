import { prisma } from "@/lib/prisma";
import { detectSubscriptions, findRecurringSubscriptions } from "@/lib/subscriptions";

// Subscription scanning script
// Scans emails for subscription patterns and creates subscription records
// Run this as a cron job or serverless function
// Example: Every 6 hours: 0 */6 * * *
export async function scanSubscriptions() {
  console.log("🔍 Scanning for subscriptions...");

  const users = await prisma.user.findMany({
    where: {
      googleAccessToken: { not: null },
    },
  });

  let totalDetected = 0;
  let totalRecurring = 0;

  for (const user of users) {
    try {
      // Detect subscriptions from emails with unsubscribe links
      const detected = await detectSubscriptions(user.id);
      totalDetected += detected.detected;

      // Find recurring senders that might be subscriptions
      const recurring = await findRecurringSubscriptions(user.id);
      totalRecurring += recurring.length;

      console.log(
        `✅ User ${user.email}: Found ${detected.detected} new subscriptions, ${recurring.length} recurring senders`
      );
    } catch (error) {
      console.error(`❌ Error scanning user ${user.email}:`, error);
    }
  }

  console.log(
    `✅ Subscription scan complete: ${totalDetected} new subscriptions, ${totalRecurring} recurring senders`
  );
  return { detected: totalDetected, recurring: totalRecurring };
}

