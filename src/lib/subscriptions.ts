import { prisma } from "./prisma";
import { openai } from "./openai";

export async function detectSubscriptions(userId: string) {
  // Find emails with unsubscribe links that aren't already tracked
  const subscriptionEmails = await prisma.email.findMany({
    where: {
      userId,
      unsubscribeLink: { not: null },
    },
    distinct: ["from"],
    orderBy: { date: "desc" },
  });

  const detected = [];

  for (const email of subscriptionEmails) {
    if (!email.from) continue;

    // Extract email from 'From' field
    const emailMatch = email.from.match(/<(.+)>/) || email.from.match(/([^\s]+@[^\s]+)/);
    const senderEmail = emailMatch ? emailMatch[1] : email.from;
    const senderName = email.from.split("<")[0].trim() || senderEmail;

    // Check if subscription already exists
    const existing = await prisma.subscription.findFirst({
      where: {
        userId,
        email: senderEmail,
      },
    });

    if (!existing) {
      // Analyze subscription details with AI
      const details = await analyzeSubscription(email.subject || "", email.snippet || "", email.body || "");

      // Create new subscription record
      const subscription = await prisma.subscription.create({
        data: {
          userId,
          email: senderEmail,
          name: senderName,
          category: details.category,
          frequency: details.frequency,
          cost: details.cost,
          currency: details.currency || "USD",
          lastEmailDate: email.date,
        },
      });

      detected.push(subscription);
    } else {
      // Update last email date
      await prisma.subscription.update({
        where: { id: existing.id },
        data: { lastEmailDate: email.date },
      });
    }
  }

  return { detected: detected.length, subscriptions: detected };
}

async function analyzeSubscription(subject: string, snippet: string, body: string) {
  try {
    const prompt = `Analyze this email to detect subscription details:

Subject: ${subject}
Snippet: ${snippet}
Body: ${body.substring(0, 500)}

Extract:
1. Category (e.g., "streaming", "news", "shopping", "software", "education")
2. Frequency (daily, weekly, monthly, or null if unknown)
3. Cost (number only, or null if free/unknown)
4. Currency (USD, EUR, etc., or null)

Respond in JSON format:
{
  "category": "streaming",
  "frequency": "monthly",
  "cost": 9.99,
  "currency": "USD"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 100,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      return { category: null, frequency: null, cost: null, currency: null };
    }

    const parsed = JSON.parse(content);
    return {
      category: parsed.category || null,
      frequency: parsed.frequency || null,
      cost: parsed.cost ? parseFloat(parsed.cost) : null,
      currency: parsed.currency || null,
    };
  } catch (error) {
    console.error("Subscription analysis error:", error);
    return { category: null, frequency: null, cost: null, currency: null };
  }
}

export async function findRecurringSubscriptions(userId: string) {
  // Find senders who email regularly
  const emails = await prisma.email.groupBy({
    by: ["from"],
    where: {
      userId,
      date: {
        gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
      },
    },
    _count: {
      from: true,
    },
    having: {
      from: {
        _count: {
          gte: 3, // At least 3 emails
        },
      },
    },
  });

  const recurring = [];

  for (const group of emails) {
    if (!group.from) continue;

    const emailMatch = group.from.match(/<(.+)>/) || group.from.match(/([^\s]+@[^\s]+)/);
    const senderEmail = emailMatch ? emailMatch[1] : group.from;

    // Check if already tracked
    const existing = await prisma.subscription.findFirst({
      where: { userId, email: senderEmail },
    });

    if (!existing) {
      recurring.push({
        email: senderEmail,
        name: group.from.split("<")[0].trim() || senderEmail,
        emailCount: group._count.from,
      });
    }
  }

  return recurring;
}

export async function calculateSubscriptionCosts(userId: string) {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId,
      unsubscribed: false,
      cost: { not: null },
    },
  });

  const totals = {
    monthly: 0,
    yearly: 0,
    total: subscriptions.length,
  };

  for (const sub of subscriptions) {
    if (!sub.cost) continue;

    if (sub.frequency === "monthly") {
      totals.monthly += sub.cost;
      totals.yearly += sub.cost * 12;
    } else if (sub.frequency === "yearly") {
      totals.yearly += sub.cost;
      totals.monthly += sub.cost / 12;
    }
  }

  return totals;
}
