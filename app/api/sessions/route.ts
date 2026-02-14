import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";
import type { CompletedTask } from "@/lib/redis";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const redis = getRedis();
    const completedToday = await redis.get<CompletedTask[]>("agents:completed_today") || [];

    // Sort by completion time descending and take last 20
    const recentSessions = completedToday
      .sort((a, b) => b.completedAt - a.completedAt)
      .slice(0, 20);

    return NextResponse.json(recentSessions);
  } catch (error) {
    console.error("Failed to fetch sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}
