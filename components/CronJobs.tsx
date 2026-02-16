"use client";

import { useState } from "react";
import { 
  ClockIcon,
  PlayIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  MinusCircleIcon
} from "@heroicons/react/24/outline";

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  nextRun: string;
  lastRun: string;
  status: string;
  target: string;
  agent: string;
}

interface CronJobsProps {
  crons: CronJob[];
  onRefresh: () => void;
}

export function CronJobs({ crons, onRefresh }: CronJobsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [runningJobs, setRunningJobs] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<"all" | "ok" | "error" | "idle">("all");

  const filteredCrons = crons.filter((cron) => {
    const matchesSearch = 
      cron.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cron.schedule.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || cron.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleRunNow = async (cronId: string, cronName: string) => {
    if (runningJobs.has(cronId)) return;

    setRunningJobs(prev => new Set(prev).add(cronId));
    
    try {
      const res = await fetch("/api/crons/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cronId }),
      });

      if (!res.ok) throw new Error("Failed to run cron job");

      alert(`✅ ${cronName} triggered successfully!`);
      onRefresh();
    } catch (error) {
      alert(`❌ Failed to run ${cronName}`);
    } finally {
      setRunningJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(cronId);
        return newSet;
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ok":
        return <CheckCircleIcon style={{ width: '20px', height: '20px', color: 'var(--accent-success)' }} />;
      case "error":
        return <ExclamationCircleIcon style={{ width: '20px', height: '20px', color: 'var(--accent-error)' }} />;
      case "idle":
        return <MinusCircleIcon style={{ width: '20px', height: '20px', color: 'var(--text-tertiary)' }} />;
      default:
        return <ClockIcon style={{ width: '20px', height: '20px', color: 'var(--text-tertiary)' }} />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ok: { background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)' },
      error: { background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-error)' },
      idle: { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' },
    };
    const style = styles[status as keyof typeof styles] || { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' };
    
    return (
      <span style={{
        padding: 'var(--space-1) var(--space-2)',
        fontSize: 'var(--text-xs)',
        fontWeight: 500,
        borderRadius: 'var(--radius-sm)',
        ...style,
      }}>
        {status}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Search and Filter */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}>
        <style jsx>{`
          @media (min-width: 640px) {
            div {
              flex-direction: row;
            }
          }
        `}</style>
        
        <input
          type="text"
          placeholder="Search cron jobs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            padding: 'var(--space-2) var(--space-4)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--bg-border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            fontSize: 'var(--text-sm)',
          }}
        />
        
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {(["all", "ok", "error", "idle"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                fontSize: 'var(--text-xs)',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                fontWeight: filterStatus === status ? 500 : 400,
                background: filterStatus === status ? 'rgba(0, 212, 255, 0.1)' : 'var(--bg-tertiary)',
                color: filterStatus === status ? 'var(--accent-primary)' : 'var(--text-secondary)',
                transition: 'all var(--transition-fast)',
              }}
            >
              {status === "all" ? "All" : status}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-4)',
        fontSize: 'var(--text-sm)',
        fontFamily: 'var(--font-mono)',
      }}>
        <span style={{ color: 'var(--text-secondary)' }}>Total: {crons.length}</span>
        <span style={{ color: 'var(--accent-success)' }}>OK: {crons.filter(c => c.status === "ok").length}</span>
        <span style={{ color: 'var(--accent-error)' }}>Errors: {crons.filter(c => c.status === "error").length}</span>
        <span style={{ color: 'var(--text-secondary)' }}>Idle: {crons.filter(c => c.status === "idle").length}</span>
      </div>

      {/* Cron Jobs Table */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--bg-border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: 'var(--font-mono)',
          }}>
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
                  Status
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
                  Name
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
                  Schedule
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
                  Next Run
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
                  Last Run
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
                  Target
                </th>
                <th style={{
                  padding: 'var(--space-2) var(--space-3)',
                  textAlign: 'right',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 500,
                  color: 'var(--text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCrons.map((cron) => (
                <tr
                  key={cron.id}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      {getStatusIcon(cron.status)}
                      {getStatusBadge(cron.status)}
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-2) var(--space-3)' }}>
                    <div style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                    }}>
                      {cron.name}
                    </div>
                    <div style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-tertiary)',
                      marginTop: '2px',
                    }}>
                      {cron.id}
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-2) var(--space-3)' }}>
                    <div style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-secondary)',
                    }}>
                      {cron.schedule}
                    </div>
                  </td>
                  <td style={{
                    padding: 'var(--space-2) var(--space-3)',
                    whiteSpace: 'nowrap',
                  }}>
                    <div style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-primary)',
                    }}>
                      {cron.nextRun}
                    </div>
                  </td>
                  <td style={{
                    padding: 'var(--space-2) var(--space-3)',
                    whiteSpace: 'nowrap',
                  }}>
                    <div style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-secondary)',
                    }}>
                      {cron.lastRun}
                    </div>
                  </td>
                  <td style={{
                    padding: 'var(--space-2) var(--space-3)',
                    whiteSpace: 'nowrap',
                  }}>
                    <span style={{
                      padding: 'var(--space-1) var(--space-2)',
                      fontSize: 'var(--text-xs)',
                      background: 'rgba(124, 58, 237, 0.1)',
                      color: 'var(--accent-secondary)',
                      borderRadius: 'var(--radius-sm)',
                    }}>
                      {cron.target}
                    </span>
                  </td>
                  <td style={{
                    padding: 'var(--space-2) var(--space-3)',
                    whiteSpace: 'nowrap',
                    textAlign: 'right',
                  }}>
                    <button
                      onClick={() => handleRunNow(cron.id, cron.name)}
                      disabled={runningJobs.has(cron.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        padding: 'var(--space-1) var(--space-3)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 500,
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        cursor: runningJobs.has(cron.id) ? 'not-allowed' : 'pointer',
                        background: runningJobs.has(cron.id) ? 'var(--bg-tertiary)' : 'rgba(0, 212, 255, 0.1)',
                        color: runningJobs.has(cron.id) ? 'var(--text-tertiary)' : 'var(--accent-primary)',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      {runningJobs.has(cron.id) ? (
                        <>
                          <div style={{
                            width: '12px',
                            height: '12px',
                            border: '2px solid var(--bg-border)',
                            borderTopColor: 'var(--accent-primary)',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                          }} />
                          Running...
                        </>
                      ) : (
                        <>
                          <PlayIcon style={{ width: '16px', height: '16px' }} />
                          Run Now
                        </>
                      )}
                    </button>
                    <style jsx>{`
                      @keyframes spin {
                        to { transform: rotate(360deg); }
                      }
                    `}</style>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCrons.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: 'var(--space-12)',
            color: 'var(--text-tertiary)',
            fontSize: 'var(--text-sm)',
          }}>
            No cron jobs found
          </div>
        )}
      </div>
    </div>
  );
}
