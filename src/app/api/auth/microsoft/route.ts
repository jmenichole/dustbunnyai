import { NextResponse } from "next/server";
import { ConfidentialClientApplication } from "@azure/msal-node";
import { prisma } from "@/lib/prisma";
import { setUserSession } from "@/app/auth/session";

const redirectUri = process.env.MICROSOFT_REDIRECT_URI || "http://localhost:3000/api/auth/microsoft/callback";

// Create MSAL client only if credentials are provided
function getMSALClient() {
  if (!process.env.MICROSOFT_CLIENT_ID || !process.env.MICROSOFT_CLIENT_SECRET) {
    throw new Error("Microsoft OAuth credentials not configured");
  }

  const msalConfig = {
    auth: {
      clientId: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      authority: "https://login.microsoftonline.com/common",
    },
  };

  return new ConfidentialClientApplication(msalConfig);
}

// Initiate OAuth flow
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/?error=" + error, request.url));
  }

  // If no code, redirect to Microsoft OAuth
  if (!code) {
    try {
      const cca = getMSALClient();
      const authCodeUrlParameters = {
        scopes: ["https://graph.microsoft.com/Mail.Read", "https://graph.microsoft.com/Mail.ReadWrite", "openid", "profile", "email"],
        redirectUri,
      };

      const authUrl = await cca.getAuthCodeUrl(authCodeUrlParameters);
      return NextResponse.redirect(authUrl);
    } catch (err) {
      console.error("Error generating Microsoft auth URL:", err);
      return NextResponse.redirect(new URL("/?error=microsoft_auth_failed", request.url));
    }
  }

  // Exchange code for tokens
  try {
    const cca = getMSALClient();
    const tokenRequest = {
      code,
      scopes: ["https://graph.microsoft.com/Mail.Read", "https://graph.microsoft.com/Mail.ReadWrite"],
      redirectUri,
    };

    const response = await cca.acquireTokenByCode(tokenRequest);

    if (!response?.accessToken) {
      throw new Error("No access token received");
    }

    // Get user info from Microsoft Graph
    const userInfoResponse = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: {
        Authorization: `Bearer ${response.accessToken}`,
      },
    });

    const userInfo = await userInfoResponse.json();

    if (!userInfo.mail && !userInfo.userPrincipalName) {
      throw new Error("No email found");
    }

    const email = userInfo.mail || userInfo.userPrincipalName;

    // Create or update user in database
    // Note: MSAL doesn't return refresh token in acquireTokenByCode response
    // Refresh tokens are managed internally by MSAL
    const user = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        name: userInfo.displayName || null,
        microsoftAccessToken: response.accessToken,
        microsoftRefreshToken: response.account?.homeAccountId || null, // Use account ID for refresh
        microsoftExpiresAt: response.expiresOn || null,
        emailProvider: "microsoft",
      },
      update: {
        name: userInfo.displayName || undefined,
        microsoftAccessToken: response.accessToken,
        microsoftRefreshToken: response.account?.homeAccountId || undefined,
        microsoftExpiresAt: response.expiresOn || undefined,
        emailProvider: "microsoft",
      },
    });

    // Set session cookie
    await setUserSession(user.id);

    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    console.error("Microsoft OAuth error:", error);
    return NextResponse.redirect(new URL("/?error=microsoft_oauth_failed", request.url));
  }
}
