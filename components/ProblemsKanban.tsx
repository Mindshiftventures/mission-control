"use client";

import { useState } from "react";
import type { Problem } from "@/lib/db/schema";

interface ProblemsKanbanProps {
  problems: Problem[];
  onProblemClick: (problem: Problem) => void;
  onRefresh: () => void;
}

const COLUMNS = [
  { id: "backlog", name: "BACKLOG" },
  { id: "planning", name: "PLANNING" },
  { id: "in_progress", name: "IN PROGRESS" },
  { id: "blocked", name: "BLOCKED" },
  { id: "review", name: "REVIEW" },
  { id: "done", name: "DONE" },
];

const PRIORITY_COLORS = {
  0: "var(--accent-info)",
  1: "var(--accent-warning)",
  2: "var(--accent-error)",
};

const PRIORITY_LABELS = {
  0: "LOW",
  1: "MEDIUM",
  2: "HIGH",
};

const PRIORITY_ICONS = {
  0: "💡",
  1: "⚠",
  2: "🔥",
};

export function ProblemsKanban({ problems, onProblemClick, onRefresh }: ProblemsKanbanProps) {
  const [draggedProblem, setDraggedProblem] = useState<Problem | null>(null);

  const handleDragStart = (problem: Problem) => {
    setDraggedProblem(problem);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (status: string) => {
    if (!draggedProblem) return;

    try {
      const res = await fetch(`/api/problems/${draggedProblem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update problem");

      onRefresh();
    } catch (error) {
      console.error("Error updating problem:", error);
      alert("Failed to update problem status");
    } finally {
      setDraggedProblem(null);
    }
  };

  const getProblemsByStatus = (status: string) => {
    return problems.filter((p) => p.status === status);
  };

  return (
    <div style={{
      display: 'flex',
      gap: 'var(--space-4)',
      overflowX: 'auto',
      paddingBottom: 'var(--space-4)',
    }}>
      {COLUMNS.map((column) => {
        const columnProblems = getProblemsByStatus(column.id);

        return (
          <div
            key={column.id}
            style={{
              flexShrink: 0,
              width: '320px',
            }}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id)}
          >
            {/* Column Header */}
            <div style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--bg-border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-3)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 'var(--space-2)',
                borderBottom: '1px solid var(--bg-border)',
              }}>
                <h3 style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  {column.name}
                </h3>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-tertiary)',
                }}>
                  ({columnProblems.length})
                </span>
              </div>

              {/* Column Body */}
              <div style={{
                marginTop: 'var(--space-3)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
                minHeight: '500px',
              }}>
                {columnProblems.map((problem) => (
                  <div
                    key={problem.id}
                    draggable
                    onDragStart={() => handleDragStart(problem)}
                    onClick={() => onProblemClick(problem)}
                    style={{
                      background: 'var(--bg-secondary)',
                      borderLeft: `3px solid ${PRIORITY_COLORS[problem.priority as keyof typeof PRIORITY_COLORS]}`,
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg-tertiary)';
                      e.currentTarget.style.borderLeftColor = 'var(--accent-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--bg-secondary)';
                      e.currentTarget.style.borderLeftColor = PRIORITY_COLORS[problem.priority as keyof typeof PRIORITY_COLORS];
                    }}
                  >
                    {/* Header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      marginBottom: 'var(--space-1)',
                    }}>
                      <span style={{ fontSize: '14px' }}>
                        {PRIORITY_ICONS[problem.priority as keyof typeof PRIORITY_ICONS]}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        color: PRIORITY_COLORS[problem.priority as keyof typeof PRIORITY_COLORS],
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        {PRIORITY_LABELS[problem.priority as keyof typeof PRIORITY_LABELS]}
                      </span>
                      <span style={{
                        marginLeft: 'auto',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text-tertiary)',
                        textTransform: 'uppercase',
                      }}>
                        {column.id === 'done' ? 'RESOLVED' : 'OPEN'}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-primary)',
                      marginBottom: 'var(--space-1)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {problem.title}
                    </h4>

                    {/* Description */}
                    {problem.description && (
                      <p style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text-tertiary)',
                        marginBottom: 'var(--space-2)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {problem.description}
                      </p>
                    )}

                    {/* Tags */}
                    {problem.tags && problem.tags.length > 0 && (
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 'var(--space-1)',
                        marginBottom: 'var(--space-2)',
                      }}>
                        {problem.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '10px',
                              color: 'var(--accent-info)',
                              background: 'rgba(59, 130, 246, 0.1)',
                              padding: '2px 6px',
                              borderRadius: 'var(--radius-sm)',
                              textTransform: 'uppercase',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                        {problem.tags.length > 3 && (
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '10px',
                            color: 'var(--text-tertiary)',
                            background: 'var(--bg-tertiary)',
                            padding: '2px 6px',
                            borderRadius: 'var(--radius-sm)',
                          }}>
                            +{problem.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div style={{
                      display: 'flex',
                      gap: 'var(--space-2)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-tertiary)',
                    }}>
                      {problem.owner && (
                        <span>{problem.owner}</span>
                      )}
                      {problem.owner && problem.assignee && (
                        <span>•</span>
                      )}
                      {problem.assignee && (
                        <span>{problem.assignee}</span>
                      )}
                      {(problem.owner || problem.assignee) && problem.createdAt && (
                        <span>•</span>
                      )}
                      {problem.createdAt && (
                        <span>{new Date(problem.createdAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
