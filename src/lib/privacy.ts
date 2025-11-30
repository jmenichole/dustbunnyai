import { breach } from "hibp";
import { prisma } from "./prisma";

export async function scanEmailForBreaches(userId: string, email: string) {
  try {
    const breaches = await breach(email);
    const list = Array.isArray(breaches) ? breaches : [];
    
    const scan = await prisma.privacyScan.create({
      data: {
        userId,
        email,
        breached: list.length > 0,
        breachCount: list.length,
        breaches: list.map((b) => ({
          name: b.Name,
          domain: b.Domain,
          breachDate: b.BreachDate,
          description: b.Description,
        })),
      },
    });

    return {
      breached: scan.breached,
      breachCount: scan.breachCount,
      breaches: scan.breaches,
    };
  } catch (error) {
    console.error("HIBP scan error:", error);
    
    // Create scan record even if error
    await prisma.privacyScan.create({
      data: {
        userId,
        email,
        breached: false,
        breachCount: 0,
      },
    });

    return { breached: false, breachCount: 0, breaches: [] };
  }
}

export async function getAllScans(userId: string) {
  return prisma.privacyScan.findMany({
    where: { userId },
    orderBy: { scannedAt: "desc" },
  });
}
