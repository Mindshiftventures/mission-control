"use client";

interface CostData {
  totalCost: number;
  totalTokens: number;
  tasksToday: number;
  byAgent: Array<{
    id: string;
    name: string;
    cost: number;
    tokens: number;
    taskCount: number;
  }>;
}

interface CostSummaryProps {
  data: CostData;
}

export function CostSummary({ data }: CostSummaryProps) {
  const { totalCost, totalTokens, tasksToday, byAgent } = data;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Summary</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium mb-1">Total Cost</div>
          <div className="text-2xl font-bold text-blue-900">${totalCost.toFixed(2)}</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="text-sm text-purple-600 font-medium mb-1">Total Tokens</div>
          <div className="text-2xl font-bold text-purple-900">
            {totalTokens.toLocaleString()}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div className="text-sm text-green-600 font-medium mb-1">Tasks Completed</div>
          <div className="text-2xl font-bold text-green-900">{tasksToday}</div>
        </div>
      </div>

      {byAgent.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Breakdown by Agent</h3>
          <div className="space-y-2">
            {byAgent
              .sort((a, b) => b.cost - a.cost)
              .map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">{agent.name}</div>
                    <div className="text-xs text-gray-500">
                      {agent.taskCount} {agent.taskCount === 1 ? "task" : "tasks"} •{" "}
                      {agent.tokens.toLocaleString()} tokens
                    </div>
                  </div>
                  <div className="font-semibold text-gray-900">${agent.cost.toFixed(2)}</div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
