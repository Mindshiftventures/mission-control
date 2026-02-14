import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";

interface DailyCost {
  date: string;
  totalCost: number;
  totalTokens: number;
  taskCount: number;
}

interface AgentCost {
  agentId: string;
  agentName: string;
  cost: number;
  tokens: number;
  taskCount: number;
}

interface ModelCost {
  model: string;
  cost: number;
  tokens: number;
  count: number;
}

export async function GET() {
  try {
    const redis = getRedis();
    
    // Get daily costs for last 30 days
    const dailyCosts: DailyCost[] = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      
      const dayData = await redis.get(`cost:daily:${dateKey}`);
      
      if (dayData && typeof dayData === 'object') {
        dailyCosts.push({
          date: dateKey,
          totalCost: (dayData as any).totalCost || 0,
          totalTokens: (dayData as any).totalTokens || 0,
          taskCount: (dayData as any).taskCount || 0,
        });
      } else {
        // No data for this day
        dailyCosts.push({
          date: dateKey,
          totalCost: 0,
          totalTokens: 0,
          taskCount: 0,
        });
      }
    }

    // Get agent breakdown (from today's data)
    const todayKey = today.toISOString().split('T')[0];
    const todayData: any = await redis.get(`cost:daily:${todayKey}`);
    
    const agentCosts: AgentCost[] = [];
    if (todayData && todayData.byAgent) {
      for (const [agentId, data] of Object.entries(todayData.byAgent)) {
        const agentData = data as any;
        agentCosts.push({
          agentId,
          agentName: agentData.name || agentId,
          cost: agentData.cost || 0,
          tokens: agentData.tokens || 0,
          taskCount: agentData.taskCount || 0,
        });
      }
    }

    // Calculate totals
    const totalCost = dailyCosts.reduce((sum, day) => sum + day.totalCost, 0);
    const avgDailyCost = dailyCosts.length > 0 
      ? totalCost / dailyCosts.filter(d => d.totalCost > 0).length 
      : 0;
    const todayCost = dailyCosts[dailyCosts.length - 1]?.totalCost || 0;

    return NextResponse.json({
      dailyCosts,
      agentCosts,
      summary: {
        totalCost30Days: totalCost,
        avgDailyCost: avgDailyCost || 0,
        todayCost,
        daysWithData: dailyCosts.filter(d => d.totalCost > 0).length,
      }
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch cost analytics" },
      { status: 500 }
    );
  }
}
