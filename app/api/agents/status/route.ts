import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";
import type { RedisAgentData } from "@/lib/redis";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const redis = getRedis();
    const data = await redis.get<RedisAgentData>("agents:status");

    if (!data) {
      return NextResponse.json(
        { error: "No agent status data available" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch agent status:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent status" },
      { status: 500 }
    );
  }
}
