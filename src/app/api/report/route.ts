import { NextResponse } from "next/server";
import { generateWeeklyReport } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const report = await generateWeeklyReport(userId);
    
    return NextResponse.json({ 
      success: true, 
      report 
    });
  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
