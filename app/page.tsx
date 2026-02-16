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
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '2px solid var(--bg-border)',
            borderTopColor: 'var(--accent-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto var(--space-4)',
          }} />
          <p style={{
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-sm)',
          }}>
            Loading Mission Control...
          </p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
      }}>
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--accent-error)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-6)',
          maxWidth: '500px',
          width: '100%',
        }}>
          <h2 style={{
            color: 'var(--accent-error)',
            fontSize: 'var(--text-lg)',
            fontWeight: 600,
            marginBottom: 'var(--space-2)',
          }}>
            Error Loading Data
          </h2>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-mono)',
            marginBottom: 'var(--space-4)',
          }}>
            {error}
          </p>
          <button
            onClick={fetchData}
            style={{
              background: 'var(--accent-primary)',
              color: 'var(--bg-primary)',
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg-primary)',
      width: '100%',
      overflowX: 'hidden',
    }}>
      {/* Header */}
      <header style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--bg-border)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        width: '100%',
      }}>
        <div style={{
          padding: 'var(--space-4) var(--space-6)',
          maxWidth: '100%',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
          }}>
            <div>
              <h1 style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}>
                Dashboard
              </h1>
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-tertiary)',
                fontFamily: 'var(--font-mono)',
                marginTop: 'var(--space-1)',
              }}>
                Real-time agent status and cost tracking
              </p>
            </div>
            {lastUpdate && (
              <div style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--text-tertiary)',
                fontFamily: 'var(--font-mono)',
              }}>
                Updated {lastUpdate.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        padding: 'var(--space-4) var(--space-6)',
        maxWidth: '100%',
        width: '100%',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-8)',
          maxWidth: '100%',
        }}>
          {/* Agent Status Cards */}
          <section style={{ width: '100%', maxWidth: '100%' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-4)',
              paddingBottom: 'var(--space-3)',
              borderBottom: '1px solid var(--bg-border)',
              flexWrap: 'wrap',
              gap: 'var(--space-3)',
            }}>
              <h2 style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 500,
                color: 'var(--text-primary)',
              }}>
                Active Agents
              </h2>
              <button style={{
                background: 'transparent',
                border: '1px solid var(--accent-primary)',
                color: 'var(--accent-primary)',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                cursor: 'pointer',
              }}>
                + New Agent
              </button>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))',
              gap: 'var(--space-4)',
              width: '100%',
            }}>
              {agentData?.agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          </section>

          {/* Cost Summary */}
          {costData && (
            <section style={{ width: '100%', maxWidth: '100%' }}>
              <CostSummary data={costData} />
            </section>
          )}

          {/* Recent Sessions */}
          <section style={{ width: '100%', maxWidth: '100%' }}>
            <SessionsTable sessions={sessions} />
          </section>
        </div>
      </main>
    </div>
  );
}
