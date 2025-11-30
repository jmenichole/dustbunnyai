import { NextResponse } from "next/server";
import { google } from "googleapis";
import { prisma } from "@/lib/prisma";
import { setUserSession } from "@/app/auth/session";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Initiate OAuth flow
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/?error=" + error, request.url));
  }

  // If no code, redirect to Google OAuth
  if (!code) {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.modify",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
      ],
      prompt: "consent", // Force to get refresh token
    });

    return NextResponse.redirect(authUrl);
  }

  // Exchange code for tokens
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    if (!userInfo.email) {
      throw new Error("No email found");
    }

    // Create or update user in database
    const user = await prisma.user.upsert({
      where: { email: userInfo.email },
      create: {
        email: userInfo.email,
        name: userInfo.name || null,
        image: userInfo.picture || null,
        googleAccessToken: tokens.access_token || null,
        googleRefreshToken: tokens.refresh_token || null,
        googleExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
      update: {
        name: userInfo.name || undefined,
        image: userInfo.picture || undefined,
        googleAccessToken: tokens.access_token || undefined,
        googleRefreshToken: tokens.refresh_token || undefined,
        googleExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
      },
    });

    // Set session cookie
    await setUserSession(user.id);

    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    console.error("OAuth error:", error);
    return NextResponse.redirect(new URL("/?error=oauth_failed", request.url));
  }
}
