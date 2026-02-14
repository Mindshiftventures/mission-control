"use client";

import { formatDistanceToNow } from "date-fns";
import type { AgentStatus } from "@/lib/redis";

interface AgentCardProps {
  agent: AgentStatus;
}

export function AgentCard({ agent }: AgentCardProps) {
  const statusColors = {
    IDLE: "bg-gray-200 text-gray-700",
    ACTIVE: "bg-green-100 text-green-700",
    WORKING: "bg-blue-100 text-blue-700",
  };

  const statusDots = {
    IDLE: "bg-gray-400",
    ACTIVE: "bg-green-500 animate-pulse",
    WORKING: "bg-blue-500 animate-pulse",
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{agent.emoji}</span>
          <div>
            <h3 className="font-semibold text-gray-900">{agent.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                  statusColors[agent.status]
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${statusDots[agent.status]}`}
                />
                {agent.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {agent.currentTask && (
        <div className="mb-3">
          <p className="text-sm text-gray-600 line-clamp-2">{agent.currentTask}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-500">Tokens:</span>
          <span className="ml-1 font-medium text-gray-900">
            {agent.totalTokens.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Cost:</span>
          <span className="ml-1 font-medium text-gray-900">
            ${agent.cost.toFixed(2)}
          </span>
        </div>
      </div>

      {agent.lastActivity && (
        <div className="mt-2 text-xs text-gray-500">
          Last active {formatDistanceToNow(new Date(agent.lastActivity), { addSuffix: true })}
        </div>
      )}
    </div>
  );
}
