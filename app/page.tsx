"use client";

import { useEffect, useState } from "react";
import { AgentCard } from "@/components/AgentCard";
import { CostSummary } from "@/components/CostSummary";
import { SessionsTable } from "@/components/SessionsTable";
import type { RedisAgentData, CompletedTask } from "@/lib/redis";

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

export default function DashboardPage() {
  const [agentData, setAgentData] = useState<RedisAgentData | null>(null);
  const [costData, setCostData] = useState<CostData | null>(null);
  const [sessions, setSessions] = useState<CompletedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      const [agentsRes, costsRes, sessionsRes] = await Promise.all([
        fetch("/api/agents/status"),
        fetch("/api/costs/today"),
        fetch("/api/sessions"),
      ]);

      if (!agentsRes.ok) throw new Error("Failed to fetch agent status");
      if (!costsRes.ok) throw new Error("Failed to fetch cost data");
      if (!sessionsRes.ok) throw new Error("Failed to fetch sessions");

      const [agents, costs, sessionsData] = await Promise.all([
        agentsRes.json(),
        costsRes.json(),
        sessionsRes.json(),
      ]);

      setAgentData(agents);
      setCostData(costs);
      setSessions(sessionsData);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
          <p className="text-gray-600">Loading Mission Control...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg">
          <h2 className="text-red-800 font-semibold mb-2">Error Loading Data</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mission Control</h1>
              <p className="text-sm text-gray-500 mt-1">
                Agent Status & Cost Tracking Dashboard
              </p>
            </div>
            {lastUpdate && (
              <div className="text-sm text-gray-500">
                Updated {lastUpdate.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Agent Status Cards */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Agent Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {agentData?.agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          </section>

          {/* Cost Summary */}
          {costData && (
            <section>
              <CostSummary data={costData} />
            </section>
          )}

          {/* Recent Sessions */}
          <section>
            <SessionsTable sessions={sessions} />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Mission Control Phase 1 • Auto-refreshes every 5 seconds
          </p>
        </div>
      </footer>
    </div>
  );
}
