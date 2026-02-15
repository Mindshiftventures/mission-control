"use client";

import { useEffect, useState } from "react";
import { CronJobs } from "@/components/CronJobs";

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

export default function CronPage() {
  const [crons, setCrons] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCrons = () => {
    setLoading(true);
    fetch("/api/crons")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch cron jobs");
        return res.json();
      })
      .then((data) => {
        setCrons(data.crons || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCrons();
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
            Loading cron jobs...
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
        padding: 'var(--space-6)',
      }}>
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--accent-error)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-6)',
          maxWidth: '500px',
        }}>
          <h2 style={{
            color: 'var(--accent-error)',
            fontSize: 'var(--text-lg)',
            fontWeight: 600,
            marginBottom: 'var(--space-2)',
          }}>
            Error Loading Cron Jobs
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
            onClick={fetchCrons}
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
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <header style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--bg-border)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{
          maxWidth: '1600px',
          margin: '0 auto',
          padding: 'var(--space-4) var(--space-6)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <h1 style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}>
                Cron Jobs
              </h1>
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-tertiary)',
                fontFamily: 'var(--font-mono)',
                marginTop: 'var(--space-1)',
              }}>
                Scheduled tasks from OpenClaw
              </p>
            </div>
            <button
              onClick={fetchCrons}
              style={{
                background: 'transparent',
                border: '1px solid var(--accent-primary)',
                color: 'var(--accent-primary)',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main style={{
        maxWidth: '1600px',
        margin: '0 auto',
        padding: 'var(--space-6)',
      }}>
        <CronJobs crons={crons} onRefresh={fetchCrons} />
      </main>
    </div>
  );
}
