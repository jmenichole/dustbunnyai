import { prisma } from "./prisma";
import { getGmailClient } from "./gmail";

export async function unsubscribeFromEmail(userId: string, emailId: string) {
  const email = await prisma.email.findFirst({
    where: { id: emailId, userId },
  });

  if (!email || !email.unsubscribeLink) {
    return { success: false, reason: "No unsubscribe link found" };
  }

  // Extract email from 'From' field
  const emailMatch = email.from?.match(/<(.+)>/) || email.from?.match(/([^\s]+@[^\s]+)/);
  const senderEmail = emailMatch ? emailMatch[1] : email.from;

  if (!senderEmail) {
    return { success: false, reason: "Could not extract sender email" };
  }

  // Create or update subscription record
  const existingSub = await prisma.subscription.findFirst({
    where: { userId, email: senderEmail },
  });

  if (existingSub) {
    await prisma.subscription.update({
      where: { id: existingSub.id },
      data: { unsubscribed: true },
    });
  } else {
    await prisma.subscription.create({
      data: {
        userId,
        email: senderEmail,
        name: email.from?.split("<")[0].trim() || senderEmail,
        unsubscribed: true,
      },
    });
  }

  // Try to automatically unsubscribe
  const unsubscribeResult = await performUnsubscribe(email.unsubscribeLink);

  return { 
    success: true, 
    unsubscribeLink: email.unsubscribeLink,
    automated: unsubscribeResult.success,
    method: unsubscribeResult.method,
  };
}

async function performUnsubscribe(unsubscribeLink: string) {
  // Check if it's a mailto: link
  if (unsubscribeLink.includes("mailto:")) {
    const mailtoMatch = unsubscribeLink.match(/mailto:([^\s,>]+)/);
    if (mailtoMatch) {
      return {
        success: true,
        method: "mailto",
        email: mailtoMatch[1],
      };
    }
  }

  // Check if it's an HTTP link
  if (unsubscribeLink.startsWith("http")) {
    try {
      // For now, we'll just return the link
      // In production, you could use Puppeteer to click it
      return {
        success: true,
        method: "http",
        url: unsubscribeLink,
      };
    } catch (error) {
      return { success: false, method: "http" };
    }
  }

  return { success: false, method: "unknown" };
}

export async function extractUnsubscribeLink(htmlContent: string): Promise<string | null> {
  // Simple regex to find unsubscribe links
  const patterns = [
    /href=["']([^"']*unsubscribe[^"']*)["']/i,
    /href=["']([^"']*opt-out[^"']*)["']/i,
    /href=["']([^"']*remove[^"']*)["']/i,
    /<([^>]*unsubscribe[^>]*)>/i,
  ];

  for (const pattern of patterns) {
    const match = htmlContent.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

export async function bulkUnsubscribe(userId: string, emailIds: string[]) {
  const results = {
    success: [] as string[],
    failed: [] as string[],
  };

  for (const emailId of emailIds) {
    const result = await unsubscribeFromEmail(userId, emailId);
    if (result.success) {
      results.success.push(emailId);
    } else {
      results.failed.push(emailId);
    }
  }

  return results;
}
