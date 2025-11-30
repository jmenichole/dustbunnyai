import { prisma } from "./prisma";
import { openai } from "./openai";

export function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

export async function generateWeeklyReport(userId: string) {
  const now = new Date();
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Get stats for the week
  const emailsCleaned = await prisma.email.count({
    where: {
      userId,
      cleaned: true,
      createdAt: { gte: weekStart },
    },
  });

  const subscriptionsFound = await prisma.subscription.count({
    where: {
      userId,
      createdAt: { gte: weekStart },
    },
  });

  // Generate AI summary
  const prompt = `Generate a brief, friendly weekly email cleanup summary for a user:
- ${emailsCleaned} emails cleaned
- ${subscriptionsFound} subscriptions found
Keep it under 50 words and encouraging.`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 100,
  });

  const summary = response.choices[0]?.message?.content || "";

  // Create report
  const report = await prisma.report.create({
    data: {
      userId,
      weekStart,
      weekEnd: now,
      emailsCleaned,
      subscriptionsFound,
      spaceFreed: emailsCleaned * 2, // Estimate 2MB per email
      moneySaved: subscriptionsFound * 5, // Estimate $5 saved per subscription
      summary,
    },
  });

  return report;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}
