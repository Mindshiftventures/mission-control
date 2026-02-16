"use client";

import { useEffect, useState } from "react";
import { ProblemsKanban } from "@/components/ProblemsKanban";
import { CreateProblem } from "@/components/CreateProblem";
import { ProblemDetail } from "@/components/ProblemDetail";
import type { Problem } from "@/lib/db/schema";

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filter, setFilter] = useState<{
    owner?: string;
    assignee?: string;
    tags?: string[];
  }>({});

  const fetchProblems = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.owner) params.append("owner", filter.owner);
      if (filter.assignee) params.append("assignee", filter.assignee);
      if (filter.tags && filter.tags.length > 0) params.append("tags", filter.tags.join(","));

      const res = await fetch(`/api/problems?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch problems");

      const data = await res.json();
      setProblems(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [filter]);

  const handleProblemCreated = () => {
    fetchProblems();
    setShowCreateDialog(false);
  };

  const handleProblemUpdated = () => {
    fetchProblems();
    setSelectedProblem(null);
  };

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
            Loading problems...
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
            Error Loading Problems
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
            onClick={fetchProblems}
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
                Problems & Projects
              </h1>
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-tertiary)',
                fontFamily: 'var(--font-mono)',
                marginTop: 'var(--space-1)',
              }}>
                Track ideas, projects, and problems
              </p>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              flexWrap: 'wrap',
            }}>
              {/* Filter Dropdown */}
              <select
                value={filter.owner || ""}
                onChange={(e) => setFilter({ ...filter, owner: e.target.value || undefined })}
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--bg-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                }}
              >
                <option value="">All Owners</option>
                <option value="birju">Birju</option>
                <option value="lyra">Lyra</option>
                <option value="shared">Shared</option>
              </select>

              <button
                onClick={() => setShowCreateDialog(true)}
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  background: 'var(--accent-primary)',
                  color: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#00b8e6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--accent-primary)';
                }}
              >
                + New Problem
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        padding: 'var(--space-4) var(--space-6)',
        maxWidth: '100%',
        width: '100%',
      }}>
        <ProblemsKanban
          problems={problems}
          onProblemClick={setSelectedProblem}
          onRefresh={fetchProblems}
        />
      </main>

      {/* Dialogs */}
      {showCreateDialog && (
        <CreateProblem
          onClose={() => setShowCreateDialog(false)}
          onCreated={handleProblemCreated}
        />
      )}

      {selectedProblem && (
        <ProblemDetail
          problemId={selectedProblem.id}
          onClose={() => setSelectedProblem(null)}
          onUpdated={handleProblemUpdated}
        />
      )}
    </div>
  );
}
