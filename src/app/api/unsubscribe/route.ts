import { NextResponse } from "next/server";
import { unsubscribeFromEmail } from "@/lib/unsubscribe";

export async function POST(request: Request) {
  try {
    const { userId, emailId } = await request.json();

    if (!userId || !emailId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const result = await unsubscribeFromEmail(userId, emailId);
    
    return NextResponse.json({ 
      success: true, 
      unsubscribed: result.success 
    });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe" },
      { status: 500 }
    );
  }
}
