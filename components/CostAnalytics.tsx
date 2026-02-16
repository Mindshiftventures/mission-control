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

const COLORS = ["#00d4ff", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#6366f1"];

export function CostAnalytics({ dailyCosts, agentCosts, summary }: CostAnalyticsProps) {
  const chartData = dailyCosts.map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    cost: parseFloat(day.totalCost.toFixed(4)),
    tokens: Math.round(day.totalTokens / 1000),
  }));

  const agentPieData = agentCosts
    .filter(agent => agent.cost > 0)
    .sort((a, b) => b.cost - a.cost)
    .map(agent => ({
      name: agent.agentName,
      value: parseFloat(agent.cost.toFixed(4)),
    }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--space-4)',
      }}>
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--bg-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-6)',
        }}>
          <div style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-tertiary)',
            marginBottom: 'var(--space-1)',
          }}>
            Today's Cost
          </div>
          <div style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 600,
            color: 'var(--accent-primary)',
            fontFamily: 'var(--font-mono)',
          }}>
            ${summary.todayCost.toFixed(4)}
          </div>
        </div>
        
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--bg-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-6)',
        }}>
          <div style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-tertiary)',
            marginBottom: 'var(--space-1)',
          }}>
            30-Day Total
          </div>
          <div style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 600,
            color: 'var(--accent-secondary)',
            fontFamily: 'var(--font-mono)',
          }}>
            ${summary.totalCost30Days.toFixed(2)}
          </div>
        </div>
        
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--bg-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-6)',
        }}>
          <div style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-tertiary)',
            marginBottom: 'var(--space-1)',
          }}>
            Daily Average
          </div>
          <div style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 600,
            color: 'var(--accent-success)',
            fontFamily: 'var(--font-mono)',
          }}>
            ${summary.avgDailyCost.toFixed(4)}
          </div>
        </div>
        
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--bg-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-6)',
        }}>
          <div style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-tertiary)',
            marginBottom: 'var(--space-1)',
          }}>
            Active Days
          </div>
          <div style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 600,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
          }}>
            {summary.daysWithData} / 30
          </div>
        </div>
      </div>

      {/* Daily Cost Trend */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--bg-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-6)',
      }}>
        <h3 style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-4)',
        }}>
          Daily Cost Trend (Last 30 Days)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12, fill: '#a0a0a0' }}
              stroke="#333333"
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#a0a0a0' }}
              stroke="#333333"
              label={{ 
                value: 'Cost ($)', 
                angle: -90, 
                position: 'insideLeft',
                fill: '#a0a0a0'
              }}
            />
            <Tooltip 
              contentStyle={{
                background: '#1a1a1a',
                border: '1px solid #333333',
                borderRadius: '4px',
                color: '#f0f0f0',
              }}
              formatter={(value: any, name: any) => {
                if (!value) return ['$0', name || ''];
                if (name === 'cost') return [`$${value.toFixed(4)}`, 'Cost'];
                if (name === 'tokens') return [`${value}K`, 'Tokens'];
                return [value, name];
              }}
            />
            <Legend 
              wrapperStyle={{
                color: '#a0a0a0'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="cost" 
              stroke="#00d4ff" 
              strokeWidth={2}
              dot={{ fill: '#00d4ff' }}
              name="Cost"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Agent Breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 'var(--space-6)',
      }}>
        <style jsx>{`
          @media (min-width: 1024px) {
            div {
              grid-template-columns: 1fr 1fr;
            }
          }
        `}</style>
        
        {/* Pie Chart */}
        {agentPieData.length > 0 && (
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--bg-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-6)',
          }}>
            <h3 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-4)',
            }}>
              Cost by Agent (Today)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={agentPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {agentPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    background: '#1a1a1a',
                    border: '1px solid #333333',
                    borderRadius: '4px',
                    color: '#f0f0f0',
                  }}
                  formatter={(value: any): any => value ? `$${value.toFixed(4)}` : '$0'} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Table */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--bg-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-6)',
        }}>
          <h3 style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-4)',
          }}>
            Agent Details (Today)
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--bg-border)' }}>
                  <th style={{
                    textAlign: 'left',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 500,
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    padding: 'var(--space-2) 0',
                  }}>
                    Agent
                  </th>
                  <th style={{
                    textAlign: 'right',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 500,
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    padding: 'var(--space-2) 0',
                  }}>
                    Cost
                  </th>
                  <th style={{
                    textAlign: 'right',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 500,
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    padding: 'var(--space-2) 0',
                  }}>
                    Tokens
                  </th>
                  <th style={{
                    textAlign: 'right',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 500,
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    padding: 'var(--space-2) 0',
                  }}>
                    Tasks
                  </th>
                </tr>
              </thead>
              <tbody>
                {agentCosts
                  .filter(agent => agent.cost > 0)
                  .sort((a, b) => b.cost - a.cost)
                  .map((agent, idx) => (
                    <tr key={agent.agentId} style={{ borderBottom: '1px solid var(--bg-border)' }}>
                      <td style={{
                        padding: 'var(--space-3) 0',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-primary)',
                      }}>
                        {agent.agentName}
                      </td>
                      <td style={{
                        padding: 'var(--space-3) 0',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--accent-primary)',
                        textAlign: 'right',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 500,
                      }}>
                        ${agent.cost.toFixed(4)}
                      </td>
                      <td style={{
                        padding: 'var(--space-3) 0',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-secondary)',
                        textAlign: 'right',
                        fontFamily: 'var(--font-mono)',
                      }}>
                        {agent.tokens.toLocaleString()}
                      </td>
                      <td style={{
                        padding: 'var(--space-3) 0',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-secondary)',
                        textAlign: 'right',
                        fontFamily: 'var(--font-mono)',
                      }}>
                        {agent.taskCount}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {agentCosts.filter(a => a.cost > 0).length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: 'var(--space-8)',
                color: 'var(--text-tertiary)',
                fontSize: 'var(--text-sm)',
              }}>
                No agent data for today
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
