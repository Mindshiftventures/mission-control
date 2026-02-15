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
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--bg-border)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-4)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-4)',
        paddingBottom: 'var(--space-3)',
        borderBottom: '1px solid var(--bg-border)',
      }}>
        <h2 style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 500,
          color: 'var(--text-primary)',
        }}>
          Today's Summary
        </h2>
      </div>

      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-6)',
      }}>
        <div style={{
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--bg-border)',
          borderRadius: 'var(--radius-sm)',
          padding: 'var(--space-3)',
        }}>
          <div style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-mono)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: 'var(--space-1)',
          }}>
            Total Cost
          </div>
          <div style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 600,
            color: 'var(--accent-primary)',
            fontFamily: 'var(--font-mono)',
          }}>
            ${totalCost.toFixed(2)}
          </div>
        </div>

        <div style={{
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--bg-border)',
          borderRadius: 'var(--radius-sm)',
          padding: 'var(--space-3)',
        }}>
          <div style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-mono)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: 'var(--space-1)',
          }}>
            Total Tokens
          </div>
          <div style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 600,
            color: 'var(--accent-secondary)',
            fontFamily: 'var(--font-mono)',
          }}>
            {totalTokens.toLocaleString()}
          </div>
        </div>

        <div style={{
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--bg-border)',
          borderRadius: 'var(--radius-sm)',
          padding: 'var(--space-3)',
        }}>
          <div style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-mono)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: 'var(--space-1)',
          }}>
            Tasks Completed
          </div>
          <div style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 600,
            color: 'var(--accent-success)',
            fontFamily: 'var(--font-mono)',
          }}>
            {tasksToday}
          </div>
        </div>
      </div>

      {/* By Agent Breakdown */}
      {byAgent.length > 0 && (
        <div>
          <h3 style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-3)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Breakdown by Agent
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
          }}>
            {byAgent
              .sort((a, b) => b.cost - a.cost)
              .map((agent) => (
                <div
                  key={agent.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-2) var(--space-3)',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--bg-border)',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--bg-border)';
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-primary)',
                      fontWeight: 500,
                    }}>
                      {agent.name}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-tertiary)',
                      marginTop: 'var(--space-1)',
                    }}>
                      {agent.taskCount} {agent.taskCount === 1 ? "task" : "tasks"} •{" "}
                      {agent.tokens.toLocaleString()} tokens
                    </div>
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-lg)',
                    fontWeight: 600,
                    color: 'var(--accent-primary)',
                  }}>
                    ${agent.cost.toFixed(2)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
