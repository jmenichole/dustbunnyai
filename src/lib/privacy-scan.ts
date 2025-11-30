import { prisma } from "./prisma";

const HIBP_API_KEY = process.env.HIBP_API_KEY || "";

export async function checkEmailBreach(email: string) {
  try {
    const response = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}`, {
      headers: {
        "hibp-api-key": HIBP_API_KEY,
        "User-Agent": "DustBunnyAI",
      },
    });

    if (response.status === 404) {
      return { breached: false, breaches: [] };
    }

    if (!response.ok) {
      throw new Error(`HIBP API error: ${response.status}`);
    }

    const breaches = await response.json();
    return { breached: true, breaches };
  } catch (error) {
    console.error("Error checking breach:", error);
    return { breached: false, breaches: [], error: true };
  }
}

export async function scanUserPrivacy(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.email) return { scanned: 0, breached: false, breaches: [] };

  // Check user's email for breaches
  const breachResult = await checkEmailBreach(user.email);

  if (breachResult.breached && breachResult.breaches.length > 0) {
    // Store breach information aggregated in model fields
    await prisma.privacyScan.create({
      data: {
        userId,
        email: user.email,
        breached: true,
        breachCount: breachResult.breaches.length,
        breaches: breachResult.breaches as any,
      },
    });
  }

  return {
    scanned: 1,
    breached: breachResult.breached,
    breaches: breachResult.breaches,
  };
}

export async function scanEmailsForPII(userId: string) {
  const emails = await prisma.email.findMany({
    where: { userId },
    take: 100,
    orderBy: { date: "desc" },
  });

  const issues = [];
  const piiPatterns = {
    ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
    creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
  };

  for (const email of emails) {
    const content = `${email.subject} ${email.snippet} ${email.body || ""}`;

    if (piiPatterns.ssn.test(content)) {
      issues.push({
        emailId: email.id,
        type: "SSN detected",
        severity: "high" as const,
      });
    }

    if (piiPatterns.creditCard.test(content)) {
      issues.push({
        emailId: email.id,
        type: "Credit card detected",
        severity: "high" as const,
      });
    }

    if (piiPatterns.phone.test(content)) {
      issues.push({
        emailId: email.id,
        type: "Phone number detected",
        severity: "medium" as const,
      });
    }
  }

  // Store PII findings
  for (const issue of issues) {
    const email = emails.find((e) => e.id === issue.emailId);
    if (email) {
      await prisma.privacyScan.create({
        data: {
          userId,
          email: email.from || "Unknown",
          breached: false,
          breachCount: 0,
          breaches: {
            type: issue.type,
            severity: issue.severity,
            from: email.from || null,
          } as any,
        },
      });
    }
  }

  return { scanned: emails.length, issues: issues.length };
}

export async function getPrivacyScans(userId: string) {
  return await prisma.privacyScan.findMany({
    where: { userId },
    orderBy: { scannedAt: "desc" },
  });
}

export async function dismissPrivacyScan(scanId: string, userId: string) {
  return await prisma.privacyScan.delete({
    where: { id: scanId, userId },
  });
}
