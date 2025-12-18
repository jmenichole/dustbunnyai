import { prisma } from "./prisma";
import { google } from "googleapis";
import { Client } from "@microsoft/microsoft-graph-client";
import { ConfidentialClientApplication } from "@azure/msal-node";

export type EmailProvider = "gmail" | "microsoft" | "yahoo" | "icloud";

export interface EmailMessage {
  id: string;
  threadId?: string;
  subject?: string;
  from?: string;
  to?: string;
  date: Date;
  snippet?: string;
  body?: string;
  labels?: string[];
  unsubscribeLink?: string;
}

export interface EmailProviderConfig {
  name: string;
  displayName: string;
  icon: string;
  authUrl: string;
  scopes: string[];
  available: boolean;
  requiresSetup: string[];
}

// Gmail implementation
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

// Microsoft implementation
export async function getMicrosoftClient(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.microsoftAccessToken) {
    throw new Error("No Microsoft tokens found");
  }

  const msalConfig = {
    auth: {
      clientId: process.env.MICROSOFT_CLIENT_ID || "",
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
      authority: "https://login.microsoftonline.com/common",
    },
  };

  const cca = new ConfidentialClientApplication(msalConfig);

  // Check if token is expired and refresh if needed
  if (user.microsoftExpiresAt && user.microsoftExpiresAt < new Date()) {
    try {
      const refreshTokenRequest = {
        refreshToken: user.microsoftRefreshToken || "",
        scopes: ["https://graph.microsoft.com/.default"],
      };

      const response = await cca.acquireTokenByRefreshToken(refreshTokenRequest);

      if (response?.accessToken) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            microsoftAccessToken: response.accessToken,
            microsoftExpiresAt: response.expiresOn || undefined,
          },
        });
      }
    } catch (error) {
      console.error("Error refreshing Microsoft token:", error);
    }
  }

  // Create Microsoft Graph client
  const client = Client.init({
    authProvider: (done) => {
      done(null, user.microsoftAccessToken!);
    },
  });

  return client;
}

// Get Yahoo client (uses OAuth 2.0)
export async function getYahooClient(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.yahooAccessToken) {
    throw new Error("No Yahoo tokens found");
  }

  // Yahoo uses OAuth 2.0 similar to Google
  const oauth2Client = new google.auth.OAuth2(
    process.env.YAHOO_CLIENT_ID,
    process.env.YAHOO_CLIENT_SECRET,
    process.env.YAHOO_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: user.yahooAccessToken,
    refresh_token: user.yahooRefreshToken,
    expiry_date: user.yahooExpiresAt?.getTime(),
  });

  // Handle automatic token refresh
  oauth2Client.on("tokens", async (tokens) => {
    if (tokens.access_token) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          yahooAccessToken: tokens.access_token,
          yahooExpiresAt: tokens.expiry_date
            ? new Date(tokens.expiry_date)
            : undefined,
        },
      });
    }
  });

  return oauth2Client;
}

// Get iCloud client (uses Apple ID OAuth)
export async function getICloudClient(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.icloudAccessToken) {
    throw new Error("No iCloud tokens found");
  }

  // iCloud uses standard OAuth 2.0
  return {
    accessToken: user.icloudAccessToken,
    refreshToken: user.icloudRefreshToken,
    expiresAt: user.icloudExpiresAt,
  };
}

// Unified interface for fetching emails
export async function fetchEmailsFromProvider(
  userId: string,
  provider: EmailProvider,
  max = 50
): Promise<EmailMessage[]> {
  switch (provider) {
    case "gmail":
      return fetchEmailsFromGmail(userId, max);
    case "microsoft":
      return fetchEmailsFromMicrosoft(userId, max);
    case "yahoo":
      return fetchEmailsFromYahoo(userId, max);
    case "icloud":
      return fetchEmailsFromICloud(userId, max);
    default:
      throw new Error(`Unsupported email provider: ${provider}`);
  }
}

async function fetchEmailsFromGmail(userId: string, max: number): Promise<EmailMessage[]> {
  const gmail = await getGmailClient(userId);

  const { data } = await gmail.users.messages.list({
    userId: "me",
    maxResults: max,
  });

  if (!data.messages) return [];

  const results: EmailMessage[] = [];

  for (const msg of data.messages) {
    const full = await gmail.users.messages.get({
      userId: "me",
      id: msg.id!,
      format: "full",
    });

    const headers = full.data.payload?.headers || [];
    const getHeader = (name: string) =>
      headers.find((h) => h.name === name)?.value || null;

    const bodyPart =
      full.data.payload?.parts?.find((p) => p.mimeType === "text/plain") ||
      full.data.payload;

    const body = bodyPart?.body?.data
      ? Buffer.from(bodyPart.body.data, "base64").toString()
      : "";

    results.push({
      id: msg.id!,
      threadId: full.data.threadId || undefined,
      subject: getHeader("Subject") || undefined,
      from: getHeader("From") || undefined,
      to: getHeader("To") || undefined,
      snippet: full.data.snippet || undefined,
      body,
      date: full.data.internalDate
        ? new Date(Number(full.data.internalDate))
        : new Date(),
      labels: full.data.labelIds || [],
      unsubscribeLink: getHeader("List-Unsubscribe") || undefined,
    });
  }

  return results;
}

async function fetchEmailsFromMicrosoft(userId: string, max: number): Promise<EmailMessage[]> {
  const client = await getMicrosoftClient(userId);

  const messages = await client
    .api("/me/messages")
    .top(max)
    .select("id,subject,from,toRecipients,receivedDateTime,bodyPreview,body,internetMessageHeaders")
    .get();

  const results: EmailMessage[] = [];

  for (const msg of messages.value) {
    // Extract unsubscribe link from headers
    const headers = msg.internetMessageHeaders || [];
    const unsubscribeHeader = headers.find(
      (h: any) => h.name?.toLowerCase() === "list-unsubscribe"
    );

    results.push({
      id: msg.id,
      subject: msg.subject || undefined,
      from: msg.from?.emailAddress?.address || undefined,
      to: msg.toRecipients?.[0]?.emailAddress?.address || undefined,
      snippet: msg.bodyPreview || undefined,
      body: msg.body?.content || "",
      date: new Date(msg.receivedDateTime),
      labels: [], // Microsoft doesn't have labels like Gmail
      unsubscribeLink: unsubscribeHeader?.value || undefined,
    });
  }

  return results;
}

async function fetchEmailsFromYahoo(userId: string, max: number): Promise<EmailMessage[]> {
  // Yahoo Mail uses IMAP protocol through OAuth
  // For now, we'll use a placeholder - Yahoo requires IMAP implementation
  console.warn("Yahoo email fetching requires IMAP implementation");
  
  // In production, you would use nodemailer with OAuth2:
  // const transport = nodemailer.createTransport({
  //   host: 'imap.mail.yahoo.com',
  //   port: 993,
  //   secure: true,
  //   auth: { type: 'OAuth2', user: email, accessToken: token }
  // });
  
  return [];
}

async function fetchEmailsFromICloud(userId: string, max: number): Promise<EmailMessage[]> {
  // iCloud Mail also uses IMAP with Apple ID OAuth
  // Similar to Yahoo, requires IMAP implementation
  console.warn("iCloud email fetching requires IMAP implementation");
  
  // In production, you would use nodemailer with OAuth2:
  // const transport = nodemailer.createTransport({
  //   host: 'imap.mail.me.com',
  //   port: 993,
  //   secure: true,
  //   auth: { type: 'OAuth2', user: email, accessToken: token }
  // });
  
  return [];
}

// Get user's active email provider
export async function getUserEmailProvider(userId: string): Promise<EmailProvider | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailProvider: true },
  });

  return (user?.emailProvider as EmailProvider) || null;
}

// Get available email providers with their configuration
export function getAvailableEmailProviders(): EmailProviderConfig[] {
  return [
    {
      name: "gmail",
      displayName: "Gmail",
      icon: "📧",
      authUrl: "/api/auth/gmail",
      scopes: ["gmail.readonly", "gmail.modify"],
      available: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      requiresSetup: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    },
    {
      name: "microsoft",
      displayName: "Outlook / Microsoft 365",
      icon: "📨",
      authUrl: "/api/auth/microsoft",
      scopes: ["Mail.Read", "Mail.ReadWrite"],
      available: !!(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET),
      requiresSetup: ["MICROSOFT_CLIENT_ID", "MICROSOFT_CLIENT_SECRET"],
    },
    {
      name: "yahoo",
      displayName: "Yahoo Mail",
      icon: "💌",
      authUrl: "/api/auth/yahoo",
      scopes: ["mail-r", "mail-w"],
      available: !!(process.env.YAHOO_CLIENT_ID && process.env.YAHOO_CLIENT_SECRET),
      requiresSetup: ["YAHOO_CLIENT_ID", "YAHOO_CLIENT_SECRET"],
    },
    {
      name: "icloud",
      displayName: "iCloud Mail",
      icon: "☁️",
      authUrl: "/api/auth/icloud",
      scopes: ["email"],
      available: !!(process.env.ICLOUD_CLIENT_ID && process.env.ICLOUD_CLIENT_SECRET),
      requiresSetup: ["ICLOUD_CLIENT_ID", "ICLOUD_CLIENT_SECRET"],
    },
  ];
}
