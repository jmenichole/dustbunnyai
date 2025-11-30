import { prisma } from "./prisma";
import { classifyEmail, classifyEmailBatch } from "./openai";

export async function classifyEmails(userId: string, limit = 100) {
  const emails = await prisma.email.findMany({
    where: {
      userId,
      category: null,
    },
    take: limit,
    select: {
      id: true,
      subject: true,
      from: true,
      snippet: true,
    },
  });

  if (emails.length === 0) {
    return { classified: 0 };
  }

  // Classify in batches of 10 to avoid rate limits
  const batchSize = 10;
  let classified = 0;

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    const results = await classifyEmailBatch(
      batch.map(e => ({
        id: e.id,
        subject: e.subject || "",
        from: e.from || "",
        snippet: e.snippet || "",
      }))
    );

    // Update all emails in this batch
    await Promise.all(
      results.map(result =>
        prisma.email.update({
          where: { id: result.id },
          data: { category: result.category },
        })
      )
    );

    classified += results.length;
  }

  return { classified };
}

export async function autoClassifyNewEmails(userId: string) {
  // Run classification on unclassified emails
  return classifyEmails(userId, 50);
}
