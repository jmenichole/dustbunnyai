import { NextRequest, NextResponse } from "next/server";
import { getSavingsRecommendations } from "@/lib/savings";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const recommendations = await getSavingsRecommendations(userId);
    
    return NextResponse.json({ 
      success: true, 
      recommendations 
    });
  } catch (error) {
    console.error("Savings recommendations error:", error);
    return NextResponse.json(
      { error: "Failed to get recommendations" },
      { status: 500 }
    );
  }
}
