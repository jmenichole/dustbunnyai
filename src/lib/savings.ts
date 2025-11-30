import { prisma } from "./prisma";
import { openai } from "./openai";

interface SavingsRecommendation {
  title: string;
  description: string;
  savings?: number;
}

export async function getSavingsRecommendations(userId: string): Promise<SavingsRecommendation[]> {
  const subscriptions = await prisma.subscription.findMany({
    where: { userId, unsubscribed: false },
  });

  const recommendations: SavingsRecommendation[] = [];

  // Find duplicate subscriptions
  const emailCounts = new Map<string, number>();
  subscriptions.forEach((sub) => {
    const domain = sub.email.split("@")[1];
    emailCounts.set(domain, (emailCounts.get(domain) || 0) + 1);
  });

  for (const [domain, count] of emailCounts.entries()) {
    if (count > 1) {
      recommendations.push({
        title: `Multiple subscriptions from ${domain}`,
        description: `You have ${count} subscriptions from this domain. Consider consolidating.`,
        savings: 0,
      });
    }
  }

  // Calculate potential savings from paid subscriptions
  const paidSubs = subscriptions.filter((s) => s.cost && s.cost > 0);
  const totalCost = paidSubs.reduce((sum, s) => sum + (s.cost || 0), 0);

  if (totalCost > 0) {
    recommendations.push({
      title: "Review paid subscriptions",
      description: `You're spending $${totalCost.toFixed(2)}/month on subscriptions. Review which ones you actively use.`,
      savings: totalCost * 0.3, // Estimate 30% savings
    });
  }

  return recommendations;
}

export async function analyzeFreeTrials(userId: string) {
  const emails = await prisma.email.findMany({
    where: {
      userId,
      category: "subscription",
    },
    orderBy: { date: "desc" },
    take: 100,
  });

  const freeTrialKeywords = ["free trial", "trial ending", "subscription renew"];
  const freeTrialEmails = emails.filter((email) =>
    freeTrialKeywords.some((keyword) =>
      (email.subject?.toLowerCase() || "").includes(keyword)
    )
  );

  return freeTrialEmails;
}
