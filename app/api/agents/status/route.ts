import { NextResponse } from "next/server";
import { readFile, readdir } from "fs/promises";
import { join } from "path";

const OPENCLAW_CONFIG = join(process.env.HOME || "/Users/lyra", ".openclaw", "openclaw.json");

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface AgentConfig {
  id: string;
  name: string;
  workspace?: string;
  model: {
    primary: string;
    fallbacks?: string[];
  };
  identity?: {
    name: string;
    emoji: string;
  };
  [key: string]: any;
}

interface SessionData {
  label?: string;
  updatedAt?: number;
  sessionId?: string;
}

export async function GET() {
  try {
    // Read openclaw config
    const configContent = await readFile(OPENCLAW_CONFIG, "utf-8");
    const config = JSON.parse(configContent);
    
    const agents = config.agents.list || [];
    const agentsDir = join(process.env.HOME || "/Users/lyra", ".openclaw", "agents");
    
    // Get list of actual agent directories
    const agentDirs = await readdir(agentsDir);
    
    const agentStatuses = [];
    
    for (const agentConfig of agents) {
      const agentId = agentConfig.id;
      
      // Check if agent directory exists
      if (!agentDirs.includes(agentId)) {
        continue;
      }
      
      const agentDir = join(agentsDir, agentId);
      const sessionsFile = join(agentDir, "sessions", "sessions.json");
      
      let status = "IDLE";
      let currentTask = undefined;
      let lastActivity = undefined;
      
      try {
        // Read sessions to find active tasks
        const sessionsContent = await readFile(sessionsFile, "utf-8");
        const sessions = JSON.parse(sessionsContent);
        
        // Find most recent session
        const sessionEntries = Object.entries(sessions) as [string, SessionData][];
        const sortedSessions = sessionEntries
          .filter(([_, session]) => session.label && session.updatedAt)
          .sort((a, b) => (b[1].updatedAt || 0) - (a[1].updatedAt || 0));
        
        if (sortedSessions.length > 0) {
          const [_, recentSession] = sortedSessions[0];
          
          // Check if there's a lock file (indicating active session)
          const sessionsDir = join(agentDir, "sessions");
          const files = await readdir(sessionsDir);
          const hasLock = files.some(f => f.endsWith('.jsonl.lock'));
          
          if (hasLock) {
            status = "ACTIVE";
            currentTask = recentSession.label;
          } else {
            status = "IDLE";
          }
          
          lastActivity = recentSession.updatedAt 
            ? new Date(recentSession.updatedAt).toISOString() 
            : undefined;
        }
      } catch (e) {
        // No sessions found or error reading
        status = "IDLE";
      }
      
      agentStatuses.push({
        id: agentId,
        name: agentConfig.identity?.name || agentConfig.name,
        emoji: agentConfig.identity?.emoji || "🤖",
        status,
        currentTask,
        lastActivity,
        model: agentConfig.model.primary,
        workspace: agentConfig.workspace,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        cost: 0
      });
    }
    
    return NextResponse.json({
      agents: agentStatuses,
      timestamp: Date.now(),
      metrics: {
        tasksToday: 0,
        totalCost: 0,
        totalTokens: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0
      }
    });
  } catch (error) {
    console.error("Failed to fetch agent status:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent status" },
      { status: 500 }
    );
  }
}
