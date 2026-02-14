"use client";

import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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

interface CostAnalyticsProps {
  dailyCosts: DailyCost[];
  agentCosts: AgentCost[];
  summary: {
    totalCost30Days: number;
    avgDailyCost: number;
    todayCost: number;
    daysWithData: number;
  };
}

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#6366f1"];

export function CostAnalytics({ dailyCosts, agentCosts, summary }: CostAnalyticsProps) {
  // Format daily costs for chart
  const chartData = dailyCosts.map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    cost: parseFloat(day.totalCost.toFixed(4)),
    tokens: Math.round(day.totalTokens / 1000), // In thousands
  }));

  // Prepare agent pie chart data
  const agentPieData = agentCosts
    .filter(agent => agent.cost > 0)
    .sort((a, b) => b.cost - a.cost)
    .map(agent => ({
      name: agent.agentName,
      value: parseFloat(agent.cost.toFixed(4)),
    }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm text-gray-500 mb-1">Today's Cost</div>
          <div className="text-2xl font-bold text-gray-900">
            ${summary.todayCost.toFixed(4)}
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm text-gray-500 mb-1">30-Day Total</div>
          <div className="text-2xl font-bold text-gray-900">
            ${summary.totalCost30Days.toFixed(2)}
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm text-gray-500 mb-1">Daily Average</div>
          <div className="text-2xl font-bold text-gray-900">
            ${summary.avgDailyCost.toFixed(4)}
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm text-gray-500 mb-1">Active Days</div>
          <div className="text-2xl font-bold text-gray-900">
            {summary.daysWithData} / 30
          </div>
        </div>
      </div>

      {/* Daily Cost Trend */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Daily Cost Trend (Last 30 Days)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ value: 'Cost ($)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name === 'cost') return [`$${value.toFixed(4)}`, 'Cost'];
                if (name === 'tokens') return [`${value}K`, 'Tokens'];
                return [value, name];
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="cost" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6' }}
              name="Cost"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Agent Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        {agentPieData.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cost by Agent (Today)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={agentPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {agentPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toFixed(4)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Agent Details (Today)
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-2">
                    Agent
                  </th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase py-2">
                    Cost
                  </th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase py-2">
                    Tokens
                  </th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase py-2">
                    Tasks
                  </th>
                </tr>
              </thead>
              <tbody>
                {agentCosts
                  .filter(agent => agent.cost > 0)
                  .sort((a, b) => b.cost - a.cost)
                  .map((agent, idx) => (
                    <tr key={agent.agentId} className="border-b border-gray-100">
                      <td className="py-3 text-sm text-gray-900">
                        {agent.agentName}
                      </td>
                      <td className="py-3 text-sm text-gray-900 text-right font-mono">
                        ${agent.cost.toFixed(4)}
                      </td>
                      <td className="py-3 text-sm text-gray-600 text-right">
                        {agent.tokens.toLocaleString()}
                      </td>
                      <td className="py-3 text-sm text-gray-600 text-right">
                        {agent.taskCount}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {agentCosts.filter(a => a.cost > 0).length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                No agent data for today
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
