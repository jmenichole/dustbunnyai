import { NextResponse } from "next/server";
import { cancelSubscription } from "@/lib/cancelFlows";

export async function POST(request: Request) {
  try {
    const { userId, subscriptionId } = await request.json();

    if (!userId || !subscriptionId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const result = await cancelSubscription(userId, subscriptionId);
    
    return NextResponse.json({ 
      success: true, 
      cancelled: result.success 
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
