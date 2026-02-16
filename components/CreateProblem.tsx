"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface CreateProblemProps {
  onClose: () => void;
  onCreated: () => void;
}

export function CreateProblem({ onClose, onCreated }: CreateProblemProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    owner: "birju",
    assignee: "",
    priority: 0,
    tags: [] as string[],
    tagInput: "",
    telegramThreadId: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Title is required");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          owner: formData.owner || null,
          assignee: formData.assignee || null,
          priority: formData.priority,
          tags: formData.tags,
          telegramThreadId: formData.telegramThreadId || null,
          createdFromTelegram: !!formData.telegramThreadId,
        }),
      });

      if (!res.ok) throw new Error("Failed to create problem");

      onCreated();
    } catch (error) {
      console.error("Error creating problem:", error);
      alert("Failed to create problem");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddTag = () => {
    if (formData.tagInput.trim() && !formData.tags.includes(formData.tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, formData.tagInput.trim()],
        tagInput: "",
      });
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

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
        maxWidth: '700px',
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
            Create New Problem
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

        {/* Form */}
        <form onSubmit={handleSubmit} style={{
          padding: 'var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-1)',
            }}>
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief title for the problem"
              required
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
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Detailed description..."
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
                Owner
              </label>
              <select
                value={formData.owner}
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
                value={formData.assignee}
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
              Tags
            </label>
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <input
                type="text"
                value={formData.tagInput}
                onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                placeholder="Add tag..."
                style={{
                  flex: 1,
                  padding: 'var(--space-2) var(--space-3)',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--bg-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--text-sm)',
                }}
              />
              <button
                type="button"
                onClick={handleAddTag}
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--bg-border)',
                  fontSize: 'var(--text-sm)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                Add
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: 'var(--space-1) var(--space-3)',
                    background: 'rgba(59, 130, 246, 0.1)',
                    color: 'var(--accent-info)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--text-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                  }}
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--accent-info)',
                      fontSize: 'var(--text-lg)',
                      lineHeight: 1,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-1)',
            }}>
              Telegram Thread ID (Optional)
            </label>
            <input
              type="text"
              value={formData.telegramThreadId}
              onChange={(e) => setFormData({ ...formData, telegramThreadId: e.target.value })}
              placeholder="Link to Telegram thread..."
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

          <div style={{ display: 'flex', gap: 'var(--space-2)', paddingTop: 'var(--space-4)' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: 1,
                padding: 'var(--space-2) var(--space-4)',
                background: submitting ? 'var(--bg-border)' : 'var(--accent-primary)',
                color: 'var(--bg-primary)',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'all var(--transition-fast)',
                opacity: submitting ? 0.5 : 1,
              }}
            >
              {submitting ? "Creating..." : "Create Problem"}
            </button>
            <button
              type="button"
              onClick={onClose}
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
        </form>
      </div>
    </div>
  );
}
