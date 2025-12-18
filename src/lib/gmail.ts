import { prisma } from "./prisma";
import {
  fetchEmailsFromProvider,
  getUserEmailProvider,
  getGmailClient as getGmailClientFromProvider,
} from "./email-providers";

// Re-export for backward compatibility
export { getGmailClient } from "./email-providers";

export async function fetchEmails(userId: string, max = 50) {
  // Get user's email provider
  const provider = await getUserEmailProvider(userId);

  if (!provider) {
    throw new Error("No email provider connected");
  }

  // Fetch emails from the provider
  const messages = await fetchEmailsFromProvider(userId, provider, max);

  const results: any[] = [];

  for (const msg of messages) {
    const email = {
      userId,
      gmailId: msg.id, // Keep as gmailId for backward compatibility
      threadId: msg.threadId || null,
      subject: msg.subject || null,
      from: msg.from || null,
      to: msg.to || null,
      snippet: msg.snippet || null,
      body: msg.body || null,
      date: msg.date,
      labels: msg.labels || [],
      unsubscribeLink: msg.unsubscribeLink || null,
    };

    results.push(email);

    // Store if not already saved
    await prisma.email.upsert({
      where: { gmailId: msg.id },
      update: email,
      create: email,
    });
  }

  return results;
}

export async function ingestGmailEmails(userId: string) {
  return fetchEmails(userId, 500);
}

export async function cleanupEmails(userId: string, emailIds: string[]) {
  const provider = await getUserEmailProvider(userId);
  
  if (!provider) {
    throw new Error("No email provider connected");
  }

  // For now, cleanup only works with Gmail (native API support for trash)
  // Other providers will need different implementations
  if (provider !== "gmail") {
    // Just mark as cleaned in database for non-Gmail providers
    for (const emailId of emailIds) {
      await prisma.email.update({
        where: { id: emailId, userId },
        data: { cleaned: true },
      });
    }
    return { count: emailIds.length };
  }

  // Gmail-specific cleanup with trash functionality
  const gmail = await getGmailClientFromProvider(userId);
  
  for (const emailId of emailIds) {
    const email = await prisma.email.findFirst({
      where: { id: emailId, userId },
    });

    if (email) {
      // Trash the email in Gmail
      await gmail.users.messages.trash({
        userId: "me",
        id: email.gmailId,
      });

      // Mark as cleaned in database
      await prisma.email.update({
        where: { id: emailId },
        data: { cleaned: true },
      });
    }
  }

  return { count: emailIds.length };
}
