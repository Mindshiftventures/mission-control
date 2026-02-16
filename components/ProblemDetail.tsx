"use client";

import { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ProblemDetailProps {
  problemId: string;
  onClose: () => void;
  onUpdated: () => void;
}

interface ProblemWithDetails {
  id: string;
  title: string;
  description: string | null;
  status: string;
  owner: string | null;
  assignee: string | null;
  priority: number;
  tags: string[] | null;
  createdAt: Date;
  updatedAt: Date;
  dueDate: Date | null;
  blockedReason: string | null;
  comments: Array<{
    id: string;
    author: string;
    content: string;
    createdAt: Date;
    source: string;
  }>;
  attachments: Array<{
    id: string;
    type: string;
    url: string;
    title: string | null;
  }>;
  activity: Array<{
    id: string;
    action: string;
    oldValue: string | null;
    newValue: string | null;
    timestamp: Date;
  }>;
}

export function ProblemDetail({ problemId, onClose, onUpdated }: ProblemDetailProps) {
  const [problem, setProblem] = useState<ProblemWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [newComment, setNewComment] = useState("");
  const [newAttachmentUrl, setNewAttachmentUrl] = useState("");

  useEffect(() => {
    fetchProblem();
  }, [problemId]);

  const fetchProblem = async () => {
    try {
      const res = await fetch(`/api/problems/${problemId}`);
      if (!res.ok) throw new Error("Failed to fetch problem");

      const data = await res.json();
      setProblem(data);
      setFormData(data);
    } catch (error) {
      console.error("Error fetching problem:", error);
      alert("Failed to load problem");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/problems/${problemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update problem");

      setEditing(false);
      fetchProblem();
      onUpdated();
    } catch (error) {
      console.error("Error updating problem:", error);
      alert("Failed to update problem");
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`/api/problems/${problemId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: "birju",
          content: newComment,
        }),
      });

      if (!res.ok) throw new Error("Failed to add comment");

      setNewComment("");
      fetchProblem();
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment");
    }
  };

  const handleAddAttachment = async () => {
    if (!newAttachmentUrl.trim()) return;

    try {
      const res = await fetch(`/api/problems/${problemId}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: newAttachmentUrl,
          type: "link",
        }),
      });

      if (!res.ok) throw new Error("Failed to add attachment");

      setNewAttachmentUrl("");
      fetchProblem();
    } catch (error) {
      console.error("Error adding attachment:", error);
      alert("Failed to add attachment");
    }
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}>
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-8)',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '2px solid var(--bg-border)',
            borderTopColor: 'var(--accent-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto',
          }} />
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!problem) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: 'var(--space-4)',
    }}>
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--bg-border)',
        borderRadius: 'var(--radius-md)',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{
          position: 'sticky',
          top: 0,
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--bg-border)',
          padding: 'var(--space-4) var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h2 style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}>
            Problem Details
          </h2>
          <button
            onClick={onClose}
            style={{
              padding: 'var(--space-2)',
              background: 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              color: 'var(--text-tertiary)',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-tertiary)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-tertiary)';
            }}
          >
            <XMarkIcon style={{ width: '24px', height: '24px' }} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: 'var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-6)',
        }}>
          {/* Edit Mode */}
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  marginBottom: 'var(--space-1)',
                }}>
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 'var(--space-2) var(--space-3)',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--bg-border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: 'var(--text-sm)',
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  marginBottom: 'var(--space-1)',
                }}>
                  Description
                </label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: 'var(--space-2) var(--space-3)',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--bg-border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-sans)',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    marginBottom: 'var(--space-1)',
                  }}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: 'var(--space-2) var(--space-3)',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--bg-border)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: 'var(--text-sm)',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="backlog">Backlog</option>
                    <option value="planning">Planning</option>
                    <option value="in_progress">In Progress</option>
                    <option value="blocked">Blocked</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    marginBottom: 'var(--space-1)',
                  }}>
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: 'var(--space-2) var(--space-3)',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--bg-border)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: 'var(--text-sm)',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="0">Low</option>
                    <option value="1">Medium</option>
                    <option value="2">High</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    marginBottom: 'var(--space-1)',
                  }}>
                    Owner
                  </label>
                  <select
                    value={formData.owner || ""}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                    style={{
                      width: '100%',
                      padding: 'var(--space-2) var(--space-3)',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--bg-border)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: 'var(--text-sm)',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">None</option>
                    <option value="birju">Birju</option>
                    <option value="lyra">Lyra</option>
                    <option value="shared">Shared</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    marginBottom: 'var(--space-1)',
                  }}>
                    Assignee
                  </label>
                  <select
                    value={formData.assignee || ""}
                    onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                    style={{
                      width: '100%',
                      padding: 'var(--space-2) var(--space-3)',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--bg-border)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: 'var(--text-sm)',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">None</option>
                    <option value="birju">Birju</option>
                    <option value="lyra">Lyra</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button
                  onClick={handleSave}
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
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormData(problem);
                  }}
                  style={{
                    padding: 'var(--space-2) var(--space-4)',
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--bg-border)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: 'var(--text-2xl)',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: 'var(--space-2)',
                  }}>
                    {problem.title}
                  </h3>
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: 'var(--text-sm)',
                  }}>
                    {problem.description}
                  </p>
                </div>
                <button
                  onClick={() => setEditing(true)}
                  style={{
                    padding: 'var(--space-2) var(--space-4)',
                    background: 'var(--accent-primary)',
                    color: 'var(--bg-primary)',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 500,
                    cursor: 'pointer',
                    marginLeft: 'var(--space-4)',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  Edit
                </button>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--space-4)',
                fontSize: 'var(--text-sm)',
              }}>
                <div>
                  <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Status:</span>{" "}
                  <span style={{ color: 'var(--text-primary)' }}>{problem.status}</span>
                </div>
                <div>
                  <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Priority:</span>{" "}
                  <span style={{ color: 'var(--text-primary)' }}>
                    {problem.priority === 0 ? "Low" : problem.priority === 1 ? "Medium" : "High"}
                  </span>
                </div>
                <div>
                  <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Owner:</span>{" "}
                  <span style={{ color: 'var(--text-primary)' }}>{problem.owner || "None"}</span>
                </div>
                <div>
                  <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Assignee:</span>{" "}
                  <span style={{ color: 'var(--text-primary)' }}>{problem.assignee || "None"}</span>
                </div>
              </div>

              {problem.tags && problem.tags.length > 0 && (
                <div>
                  <span style={{
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    fontSize: 'var(--text-sm)',
                  }}>
                    Tags:
                  </span>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 'var(--space-2)',
                    marginTop: 'var(--space-2)',
                  }}>
                    {problem.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          padding: 'var(--space-1) var(--space-3)',
                          background: 'rgba(59, 130, 246, 0.1)',
                          color: 'var(--accent-info)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 'var(--text-sm)',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Comments */}
          <div>
            <h4 style={{
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-3)',
              fontSize: 'var(--text-base)',
            }}>
              Comments ({problem.comments.length})
            </h4>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
              marginBottom: 'var(--space-4)',
            }}>
              {problem.comments.map((comment) => (
                <div
                  key={comment.id}
                  style={{
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-sm)',
                    padding: 'var(--space-4)',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--space-2)',
                  }}>
                    <span style={{
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      fontSize: 'var(--text-sm)',
                    }}>
                      {comment.author}
                    </span>
                    <span style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-tertiary)',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: 'var(--text-sm)',
                  }}>
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                style={{
                  flex: 1,
                  padding: 'var(--space-2) var(--space-3)',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--bg-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--text-sm)',
                }}
                onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
              />
              <button
                onClick={handleAddComment}
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
              >
                Add
              </button>
            </div>
          </div>

          {/* Attachments */}
          <div>
            <h4 style={{
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-3)',
              fontSize: 'var(--text-base)',
            }}>
              Attachments ({problem.attachments.length})
            </h4>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
              marginBottom: 'var(--space-4)',
            }}>
              {problem.attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-sm)',
                    padding: 'var(--space-3)',
                    textDecoration: 'none',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-border)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--bg-tertiary)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span style={{ fontSize: 'var(--text-base)' }}>🔗</span>
                    <span style={{
                      color: 'var(--text-primary)',
                      fontSize: 'var(--text-sm)',
                    }}>
                      {attachment.title || attachment.url}
                    </span>
                  </div>
                </a>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input
                type="text"
                value={newAttachmentUrl}
                onChange={(e) => setNewAttachmentUrl(e.target.value)}
                placeholder="Add attachment URL..."
                style={{
                  flex: 1,
                  padding: 'var(--space-2) var(--space-3)',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--bg-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--text-sm)',
                }}
                onKeyPress={(e) => e.key === "Enter" && handleAddAttachment()}
              />
              <button
                onClick={handleAddAttachment}
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
              >
                Add
              </button>
            </div>
          </div>

          {/* Activity Log */}
          <div>
            <h4 style={{
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-3)',
              fontSize: 'var(--text-base)',
            }}>
              Activity
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {problem.activity.map((activity) => (
                <div
                  key={activity.id}
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <span style={{ fontWeight: 500 }}>{activity.action}</span>
                  {activity.oldValue && activity.newValue && (
                    <>
                      {" "}
                      from <span style={{ fontWeight: 500 }}>{activity.oldValue}</span> to{" "}
                      <span style={{ fontWeight: 500 }}>{activity.newValue}</span>
                    </>
                  )}
                  {!activity.oldValue && activity.newValue && (
                    <> - {activity.newValue}</>
                  )}
                  <span style={{
                    color: 'var(--text-tertiary)',
                    marginLeft: 'var(--space-2)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                  }}>
                    {new Date(activity.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
