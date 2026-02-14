"use client";

import { useEffect, useState } from "react";
import { CostAnalytics } from "@/components/CostAnalytics";

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

interface AnalyticsData {
  dailyCosts: DailyCost[];
  agentCosts: AgentCost[];
  summary: {
    totalCost30Days: number;
    avgDailyCost: number;
    todayCost: number;
    daysWithData: number;
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch analytics");
        return res.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg">
          <h2 className="text-red-800 font-semibold mb-2">Error Loading Analytics</h2>
          <p className="text-red-600">{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cost Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">
              30-day cost trends and breakdowns
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CostAnalytics 
          dailyCosts={data.dailyCosts}
          agentCosts={data.agentCosts}
          summary={data.summary}
        />
      </main>
    </div>
  );
}
