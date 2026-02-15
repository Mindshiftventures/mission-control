"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { 
  PencilIcon, 
  CheckIcon,
  XMarkIcon,
  CodeBracketIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from "@heroicons/react/24/outline";
import type { AgentStatus } from "@/lib/redis";

interface AgentCardProps {
  agent: AgentStatus;
}

interface AgentConfig {
  id: string;
  name: string;
  workspace?: string;
  model: {
    primary: string;
    fallbacks?: string[];
  };
  identity?: {
    name: string;
    emoji: string;
  };
  [key: string]: any;
}

interface ClaudeCodeStatus {
  isActive: boolean;
  method: string;
  details: any;
}

export function AgentCard({ agent }: AgentCardProps) {
  const [showConfig, setShowConfig] = useState(false);
  const [agentConfig, setAgentConfig] = useState<AgentConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedModel, setEditedModel] = useState("");
  const [claudeCodeStatus, setClaudeCodeStatus] = useState<ClaudeCodeStatus | null>(null);
  
  const statusColors: Record<string, string> = {
    IDLE: "#666666",
    ACTIVE: "#10b981",
    WORKING: "#00d4ff",
  };
  
  useEffect(() => {
    if (showConfig && !agentConfig) {
      fetchAgentConfig();
    }
  }, [showConfig]);
  
  useEffect(() => {
    if (agent.id === "engineer" || agent.id === "developer") {
      fetchClaudeCodeStatus();
      const interval = setInterval(fetchClaudeCodeStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [agent.id]);
  
  const fetchAgentConfig = async () => {
    try {
      const res = await fetch(`/api/agents/${agent.id}/config`);
      if (res.ok) {
        const data = await res.json();
        setAgentConfig(data.agent);
        setEditedModel(data.agent.model.primary);
      }
    } catch (error) {
      console.error("Failed to fetch agent config:", error);
    }
  };
  
  const fetchClaudeCodeStatus = async () => {
    try {
      const res = await fetch(`/api/agents/${agent.id}/claude-code`);
      if (res.ok) {
        const data = await res.json();
        setClaudeCodeStatus(data);
      }
    } catch (error) {
      console.error("Failed to fetch Claude Code status:", error);
    }
  };
  
  const handleSaveConfig = async () => {
    if (!agentConfig) return;
    
    try {
      const res = await fetch(`/api/agents/${agent.id}/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: {
            ...agentConfig.model,
            primary: editedModel
          }
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setAgentConfig(data.agent);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Failed to save agent config:", error);
    }
  };

  return (
    <div 
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--bg-border)',
        borderRadius: 'var(--radius-sm)',
        padding: 'var(--space-3)',
        transition: 'all var(--transition-fast)',
        minWidth: '200px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--bg-border)';
      }}
    >
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: statusColors[agent.status],
            display: 'inline-block',
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-base)',
            color: 'var(--text-primary)',
            fontWeight: 500,
            flex: 1,
          }}
        >
          {agent.name}
        </span>
        <button
          onClick={() => setShowConfig(!showConfig)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-tertiary)',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {showConfig ? (
            <ChevronUpIcon style={{ width: '16px', height: '16px' }} />
          ) : (
            <ChevronDownIcon style={{ width: '16px', height: '16px' }} />
          )}
        </button>
      </div>

      {/* Status & Time */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 'var(--space-2)', 
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        marginBottom: 'var(--space-2)',
      }}>
        <span
          style={{
            color: statusColors[agent.status],
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {agent.status}
        </span>
        <span style={{ color: 'var(--text-tertiary)' }}>|</span>
        <span style={{ color: 'var(--text-tertiary)' }}>
          {agent.lastActivity 
            ? formatDistanceToNow(new Date(agent.lastActivity), { addSuffix: false })
            : 'never'}
        </span>
      </div>

      {/* Claude Code Badge */}
      {claudeCodeStatus?.isActive && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--space-1)',
          marginBottom: 'var(--space-2)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
          color: 'var(--accent-secondary)',
        }}>
          <CodeBracketIcon style={{ width: '12px', height: '12px' }} />
          <span>CLAUDE CODE</span>
        </div>
      )}

      {/* Current Task */}
      {agent.currentTask && (
        <div style={{
          background: 'rgba(0, 212, 255, 0.1)',
          borderLeft: '2px solid var(--accent-primary)',
          padding: 'var(--space-2)',
          marginBottom: 'var(--space-2)',
          borderRadius: 'var(--radius-sm)',
        }}>
          <p style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--text-tertiary)',
            marginBottom: 'var(--space-1)',
          }}>
            Current Task:
          </p>
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
          }}>
            {agent.currentTask}
          </p>
        </div>
      )}

      {/* Divider */}
      <hr style={{
        border: 'none',
        height: '1px',
        background: 'var(--bg-border)',
        margin: 'var(--space-2) 0',
      }} />

      {/* Metrics */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-1)',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-sm)',
        color: 'var(--text-secondary)',
      }}>
        <div>
          <span style={{ color: 'var(--text-tertiary)' }}>Tasks:</span>
          {' '}
          <span>{agent.totalTokens > 0 ? Math.floor(agent.totalTokens / 10000) : 0}</span>
        </div>
        <div>
          <span style={{ color: 'var(--text-tertiary)' }}>Memory:</span>
          {' '}
          <span>{((agent.totalTokens / 200000) * 100).toFixed(0)}%</span>
        </div>
      </div>
      
      {/* Config Panel */}
      {showConfig && agentConfig && (
        <div style={{
          marginTop: 'var(--space-3)',
          paddingTop: 'var(--space-3)',
          borderTop: '1px solid var(--bg-border)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
            <h4 style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              fontWeight: 500,
            }}>
              Configuration
            </h4>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-1)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--accent-primary)',
                  background: 'transparent',
                  border: 'none',
                }}
              >
                <PencilIcon style={{ width: '12px', height: '12px' }} />
                Edit
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button
                  onClick={handleSaveConfig}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-1)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--accent-success)',
                    background: 'transparent',
                    border: 'none',
                  }}
                >
                  <CheckIcon style={{ width: '12px', height: '12px' }} />
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedModel(agentConfig.model.primary);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-1)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--accent-error)',
                    background: 'transparent',
                    border: 'none',
                  }}
                >
                  <XMarkIcon style={{ width: '12px', height: '12px' }} />
                  Cancel
                </button>
              </div>
            )}
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            fontSize: 'var(--text-xs)',
          }}>
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>ID:</span>
              {' '}
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                {agentConfig.id}
              </span>
            </div>
            
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Model:</span>
              {isEditing ? (
                <input
                  type="text"
                  value={editedModel}
                  onChange={(e) => setEditedModel(e.target.value)}
                  style={{
                    width: '100%',
                    marginTop: 'var(--space-1)',
                    fontFamily: 'var(--font-mono)',
                  }}
                />
              ) : (
                <span style={{ 
                  marginLeft: 'var(--space-2)', 
                  fontFamily: 'var(--font-mono)', 
                  color: 'var(--text-secondary)',
                  display: 'block',
                  marginTop: 'var(--space-1)',
                  wordBreak: 'break-all',
                }}>
                  {agentConfig.model.primary}
                </span>
              )}
            </div>
            
            {agentConfig.workspace && (
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Workspace:</span>
                <span style={{ 
                  marginLeft: 'var(--space-2)', 
                  fontFamily: 'var(--font-mono)', 
                  color: 'var(--text-secondary)',
                  fontSize: '10px',
                  display: 'block',
                  marginTop: 'var(--space-1)',
                  wordBreak: 'break-all',
                }}>
                  {agentConfig.workspace}
                </span>
              </div>
            )}
            
            {claudeCodeStatus && (
              <div style={{ paddingTop: 'var(--space-2)', borderTop: '1px solid rgba(51, 51, 51, 0.5)' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Claude Code:</span>
                <div style={{ marginLeft: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
                  <span style={{ 
                    fontWeight: 500, 
                    color: claudeCodeStatus.isActive ? 'var(--accent-secondary)' : 'var(--text-tertiary)',
                  }}>
                    {claudeCodeStatus.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {claudeCodeStatus.isActive && claudeCodeStatus.details && (
                    <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>
                      Detection: {claudeCodeStatus.method}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
