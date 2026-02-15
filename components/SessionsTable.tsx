"use client";

import { formatDistanceToNow } from "date-fns";
import type { CompletedTask } from "@/lib/redis";

interface SessionsTableProps {
  sessions: CompletedTask[];
}

export function SessionsTable({ sessions }: SessionsTableProps) {
  if (sessions.length === 0) {
    return (
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--bg-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-8)',
        textAlign: 'center',
      }}>
        <p style={{
          color: 'var(--text-tertiary)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-sm)',
        }}>
          No completed sessions today
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--bg-border)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: 'var(--space-4)',
        borderBottom: '1px solid var(--bg-border)',
      }}>
        <h2 style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 500,
          color: 'var(--text-primary)',
        }}>
          Recent Sessions
        </h2>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--bg-border)' }}>
              <th style={{
                padding: 'var(--space-2) var(--space-3)',
                textAlign: 'left',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-xs)',
                fontWeight: 500,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Agent
              </th>
              <th style={{
                padding: 'var(--space-2) var(--space-3)',
                textAlign: 'left',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-xs)',
                fontWeight: 500,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Task
              </th>
              <th style={{
                padding: 'var(--space-2) var(--space-3)',
                textAlign: 'left',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-xs)',
                fontWeight: 500,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Tokens
              </th>
              <th style={{
                padding: 'var(--space-2) var(--space-3)',
                textAlign: 'left',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-xs)',
                fontWeight: 500,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Cost
              </th>
              <th style={{
                padding: 'var(--space-2) var(--space-3)',
                textAlign: 'left',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-xs)',
                fontWeight: 500,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Completed
              </th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session, idx) => (
              <tr
                key={idx}
                style={{
                  borderBottom: '1px solid var(--bg-border)',
                  transition: 'background var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <td style={{
                  padding: 'var(--space-2) var(--space-3)',
                  whiteSpace: 'nowrap',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-primary)',
                    fontWeight: 500,
                  }}>
                    {session.agentName}
                  </div>
                </td>
                <td style={{
                  padding: 'var(--space-2) var(--space-3)',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    maxWidth: '400px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {session.label}
                  </div>
                </td>
                <td style={{
                  padding: 'var(--space-2) var(--space-3)',
                  whiteSpace: 'nowrap',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                  }}>
                    {session.tokens.toLocaleString()}
                  </div>
                </td>
                <td style={{
                  padding: 'var(--space-2) var(--space-3)',
                  whiteSpace: 'nowrap',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--accent-primary)',
                    fontWeight: 500,
                  }}>
                    ${session.cost.toFixed(2)}
                  </div>
                </td>
                <td style={{
                  padding: 'var(--space-2) var(--space-3)',
                  whiteSpace: 'nowrap',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-tertiary)',
                  }}>
                    {formatDistanceToNow(new Date(session.completedAt), { addSuffix: true })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
