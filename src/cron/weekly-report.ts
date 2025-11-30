import { prisma } from "@/lib/prisma";
import { openai } from "@/lib/openai";

/**
 * Weekly report generation cron job
 * Generates AI-powered summaries of email activity
 * Example: 0 9 * * 1 (Mondays at 9am)
 */
export async function generateWeeklyReports() {
  console.log("📊 Generating weekly reports...");

  const users = await prisma.user.findMany({
    where: {
      googleAccessToken: { not: null },
    },
  });

  let totalGenerated = 0;

  for (const user of users) {
    try {
      await generateReportForUser(user.id);
      totalGenerated++;
      console.log(`✅ Generated report for user ${user.email}`);
    } catch (error) {
      console.error(`❌ Error generating report for user ${user.email}:`, error);
    }
  }

  console.log(`✅ Weekly report generation complete: ${totalGenerated} reports`);
  return { generated: totalGenerated };
}

async function generateReportForUser(userId: string) {
  const weekEnd = new Date();
  const weekAgo = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Get email stats from past week
  const emails = await prisma.email.findMany({
    where: {
      userId,
      date: { gte: weekAgo },
    },
  });

  const stats = {
    total: emails.length,
    promotional: emails.filter((e) => e.category === "promotional").length,
    important: emails.filter((e) => e.category === "important").length,
    newsletter: emails.filter((e) => e.category === "newsletter").length,
    spam: emails.filter((e) => e.category === "spam").length,
    personal: emails.filter((e) => e.category === "personal").length,
  };

  // Find top senders
  const senderCounts: Record<string, number> = {};
  emails.forEach((e) => {
    const from = e.from || "Unknown";
    senderCounts[from] = (senderCounts[from] || 0) + 1;
  });
  const topSenders = Object.entries(senderCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([sender]) => sender);

  // Generate AI summary
  const summary = await generateAISummary(stats, topSenders);

  // Create report
  await prisma.report.create({
    data: {
      userId,
      weekStart: weekAgo,
      weekEnd,
      summary,
      details: {
        stats,
        topSenders,
      },
    },
  });
}

async function generateAISummary(stats: any, topSenders: string[]) {
  try {
    const prompt = `Generate a friendly weekly email summary based on these stats:

Total emails: ${stats.total}
Promotional: ${stats.promotional}
Important: ${stats.important}
Newsletters: ${stats.newsletter}
Spam: ${stats.spam}
Personal: ${stats.personal}

Top senders: ${topSenders.join(", ")}

Write a concise, friendly 2-3 sentence summary highlighting key insights and actionable recommendations.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 150,
    });

    return response.choices[0]?.message?.content?.trim() || "Weekly summary generated.";
  } catch (error) {
    console.error("Error generating AI summary:", error);
    return `You received ${stats.total} emails this week. ${stats.promotional} were promotional and ${stats.important} were marked important.`;
  }
}

// Removed local runner and duplicate implementation to avoid ESM and type conflicts.
