import { NextResponse } from "next/server";
import { cleanupEmails } from "@/lib/gmail";

export async function POST(request: Request) {
  try {
    const { userId, emailIds } = await request.json();

    if (!userId || !emailIds || !Array.isArray(emailIds)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const result = await cleanupEmails(userId, emailIds);
    
    return NextResponse.json({ 
      success: true, 
      emailsCleaned: result.count 
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json(
      { error: "Failed to cleanup emails" },
      { status: 500 }
    );
  }
}
