import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

export function getRedis() {
  if (!redis) {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      throw new Error("Redis credentials not configured");
    }
    redis = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
  }
  return redis;
}

export interface AgentStatus {
  id: string;
  name: string;
  emoji: string;
  status: "IDLE" | "ACTIVE" | "WORKING";
  currentTask?: string;
  lastActivity?: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
}

export interface RedisAgentData {
  agents: AgentStatus[];
  timestamp: number;
  metrics: {
    tasksToday: number;
    totalCost: number;
    totalTokens: number;
    totalInputTokens: number;
    totalOutputTokens: number;
  };
  lastCompleted?: {
    task: string;
    agentName: string;
    completedAt: string;
  };
}

export interface CompletedTask {
  agentId: string;
  agentName: string;
  label: string;
  completedAt: number;
  tokens: number;
  cost: number;
}
