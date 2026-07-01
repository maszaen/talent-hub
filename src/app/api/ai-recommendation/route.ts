import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAIRecommendation } from "@/lib/ai-recommendation";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const recommendations = await getAIRecommendation(session.user.id!);
    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("AI recommendation error:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
