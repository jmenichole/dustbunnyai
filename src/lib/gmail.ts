import { google } from "googleapis";
import { prisma } from "./prisma";

export async function getGmailClient(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.googleAccessToken) {
    throw new Error("No Google tokens found");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: user.googleAccessToken,
    refresh_token: user.googleRefreshToken,
    expiry_date: user.googleExpiresAt?.getTime(),
  });

  // Handle automatic token refresh
  oauth2Client.on("tokens", async (tokens) => {
    if (tokens.access_token) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          googleAccessToken: tokens.access_token,
          googleExpiresAt: tokens.expiry_date
            ? new Date(tokens.expiry_date)
            : undefined,
        },
      });
    }
  });

  return google.gmail({ version: "v1", auth: oauth2Client });
}

function getHeader(headers: any[], name: string) {
  return headers.find((h) => h.name === name)?.value || null;
}

export async function fetchEmails(userId: string, max = 50) {
  const gmail = await getGmailClient(userId);

  // Fetch list of messages
  const { data } = await gmail.users.messages.list({
    userId: "me",
    maxResults: max,
  });

  if (!data.messages) return [];

  let results: any[] = [];

  for (const msg of data.messages) {
    const full = await gmail.users.messages.get({
      userId: "me",
      id: msg.id!,
      format: "full",
    });

    const headers = full.data.payload?.headers || [];
    const bodyPart =
      full.data.payload?.parts?.find((p) => p.mimeType === "text/plain") ||
      full.data.payload;

    const body = bodyPart?.body?.data
      ? Buffer.from(bodyPart.body.data, "base64").toString()
      : "";

    const email = {
      userId,
      gmailId: msg.id!,
      threadId: full.data.threadId || null,
      subject: getHeader(headers, "Subject"),
      from: getHeader(headers, "From"),
      to: getHeader(headers, "To"),
      snippet: full.data.snippet || null,
      body,
      date: full.data.internalDate
        ? new Date(Number(full.data.internalDate))
        : new Date(),
      labels: full.data.labelIds || [],
      unsubscribeLink: getHeader(headers, "List-Unsubscribe"),
    };

    results.push(email);

    // Store if not already saved
    await prisma.email.upsert({
      where: { gmailId: msg.id! },
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
  const gmail = await getGmailClient(userId);
  
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
