import { NextResponse } from "next/server";
import { fetchEmails } from "@/lib/gmail";
import { getUserSession } from "@/app/auth/session";

export async function POST(request: Request) {
  try {
    const session = await getUserSession();

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { max = 50 } = await request.json().catch(() => ({}));
    const emails = await fetchEmails(session.id, max);
    
    return NextResponse.json({ 
      success: true, 
      count: emails.length,
      emails 
    });
  } catch (error) {
    console.error("Gmail ingestion error:", error);
    return NextResponse.json(
      { error: "Failed to ingest emails", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
