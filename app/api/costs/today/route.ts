import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";
import type { RedisAgentData, CompletedTask } from "@/lib/redis";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const redis = getRedis();
    
    // Get overall metrics
    const statusData = await redis.get<RedisAgentData>("agents:status");
    const completedToday = await redis.get<CompletedTask[]>("agents:completed_today") || [];

    // Calculate breakdown by agent
    const byAgent = completedToday.reduce((acc, task) => {
      if (!acc[task.agentId]) {
        acc[task.agentId] = {
          id: task.agentId,
          name: task.agentName,
          cost: 0,
          tokens: 0,
          taskCount: 0,
        };
      }
      acc[task.agentId].cost += task.cost;
      acc[task.agentId].tokens += task.tokens;
      acc[task.agentId].taskCount += 1;
      return acc;
    }, {} as Record<string, { id: string; name: string; cost: number; tokens: number; taskCount: number }>);

    const totalCost = statusData?.metrics.totalCost || 0;
    const totalTokens = statusData?.metrics.totalTokens || 0;
    const tasksToday = completedToday.length;

    return NextResponse.json({
      totalCost,
      totalTokens,
      tasksToday,
      byAgent: Object.values(byAgent),
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Failed to fetch cost data:", error);
    return NextResponse.json(
      { error: "Failed to fetch cost data" },
      { status: 500 }
    );
  }
}
