import { NextResponse } from "next/server";
import { scanEmailForBreaches } from "@/lib/privacy";

export async function POST(request: Request) {
  try {
    const { userId, email } = await request.json();

    if (!userId || !email) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const result = await scanEmailForBreaches(userId, email);
    
    return NextResponse.json({ 
      success: true, 
      breached: result.breached,
      breachCount: result.breachCount 
    });
  } catch (error) {
    console.error("Privacy scan error:", error);
    return NextResponse.json(
      { error: "Failed to scan for breaches" },
      { status: 500 }
    );
  }
}
