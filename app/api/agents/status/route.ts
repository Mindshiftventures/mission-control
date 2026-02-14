import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";
import type { RedisAgentData } from "@/lib/redis";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    // Debug: Check env vars
    const hasUrl = !!process.env.KV_REST_API_URL;
    const hasToken = !!process.env.KV_REST_API_TOKEN;
    
    if (!hasUrl || !hasToken) {
      return NextResponse.json(
        { 
          error: "Redis credentials not configured", 
          debug: { hasUrl, hasToken } 
        },
        { status: 500 }
      );
    }

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
      { 
        error: "Failed to fetch agent status",
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
