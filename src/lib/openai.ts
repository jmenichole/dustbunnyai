import OpenAI from "openai";

// Lazy initialization to avoid build-time errors
let openaiInstance: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiInstance) {
    openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }
  return openaiInstance;
}

export const openai = new Proxy({} as OpenAI, {
  get: (target, prop) => {
    const client = getOpenAIClient();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});

// Email categories
export type EmailCategory = 
  | "promotional" 
  | "subscription" 
  | "important" 
  | "newsletter" 
  | "spam" 
  | "personal"
  | "receipt"
  | "social"
  | "updates";

export async function classifyEmail(
  subject: string, 
  from: string, 
  snippet: string
): Promise<EmailCategory> {
  try {
    const prompt = `Classify this email into ONE category: promotional, subscription, important, newsletter, spam, personal, receipt, social, or updates.

Subject: ${subject}
From: ${from}
Preview: ${snippet}

Return ONLY the category name, nothing else.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 10,
    });

    const category = response.choices[0]?.message?.content?.trim().toLowerCase() as EmailCategory;
    
    // Validate category
    const validCategories: EmailCategory[] = [
      "promotional", "subscription", "important", "newsletter", 
      "spam", "personal", "receipt", "social", "updates"
    ];
    
    if (validCategories.includes(category)) {
      return category;
    }
    
    return "updates"; // Default fallback
  } catch (error) {
    console.error("Classification error:", error);
    return "updates";
  }
}

export async function classifyEmailBatch(
  emails: Array<{ id: string; subject: string; from: string; snippet: string }>
): Promise<Array<{ id: string; category: EmailCategory }>> {
  const results = await Promise.all(
    emails.map(async (email) => ({
      id: email.id,
      category: await classifyEmail(email.subject, email.from, email.snippet),
    }))
  );
  
  return results;
}
