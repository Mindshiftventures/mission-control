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
  
  const statusColors = {
    IDLE: "bg-gray-200 text-gray-700",
    ACTIVE: "bg-green-100 text-green-700",
    WORKING: "bg-blue-100 text-blue-700",
  };

  const statusDots = {
    IDLE: "bg-gray-400",
    ACTIVE: "bg-green-500 animate-pulse",
    WORKING: "bg-blue-500 animate-pulse",
  };
  
  useEffect(() => {
    if (showConfig && !agentConfig) {
      fetchAgentConfig();
    }
  }, [showConfig]);
  
  useEffect(() => {
    if (agent.id === "engineer" || agent.id === "developer") {
      fetchClaudeCodeStatus();
      const interval = setInterval(fetchClaudeCodeStatus, 30000); // Check every 30s
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
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-3xl">{agent.emoji}</span>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{agent.name}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                  statusColors[agent.status]
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${statusDots[agent.status]}`}
                />
                {agent.status}
              </span>
              
              {claudeCodeStatus?.isActive && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                  <CodeBracketIcon className="w-3 h-3" />
                  Claude Code Active
                </span>
              )}
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showConfig ? (
            <ChevronUpIcon className="w-5 h-5" />
          ) : (
            <ChevronDownIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      {agent.currentTask && (
        <div className="mb-3 p-2 bg-blue-50 rounded-md">
          <p className="text-xs text-gray-500 mb-1">Current Task:</p>
          <p className="text-sm text-gray-700 font-medium">{agent.currentTask}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-500">Tokens:</span>
          <span className="ml-1 font-medium text-gray-900">
            {agent.totalTokens.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Cost:</span>
          <span className="ml-1 font-medium text-gray-900">
            ${agent.cost.toFixed(2)}
          </span>
        </div>
      </div>

      {agent.lastActivity && (
        <div className="mt-2 text-xs text-gray-500">
          Last active {formatDistanceToNow(new Date(agent.lastActivity), { addSuffix: true })}
        </div>
      )}
      
      {showConfig && agentConfig && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm text-gray-700">Configuration</h4>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                >
                  <PencilIcon className="w-3 h-3" />
                  Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveConfig}
                    className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700"
                  >
                    <CheckIcon className="w-3 h-3" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedModel(agentConfig.model.primary);
                    }}
                    className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                  >
                    <XMarkIcon className="w-3 h-3" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
            
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-gray-500">ID:</span>
                <span className="ml-2 font-mono text-gray-700">{agentConfig.id}</span>
              </div>
              
              <div>
                <span className="text-gray-500">Model:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedModel}
                    onChange={(e) => setEditedModel(e.target.value)}
                    className="ml-2 px-2 py-1 border border-gray-300 rounded text-xs font-mono w-full mt-1"
                  />
                ) : (
                  <span className="ml-2 font-mono text-gray-700">{agentConfig.model.primary}</span>
                )}
              </div>
              
              {agentConfig.workspace && (
                <div>
                  <span className="text-gray-500">Workspace:</span>
                  <span className="ml-2 font-mono text-gray-700 text-[10px]">{agentConfig.workspace}</span>
                </div>
              )}
              
              {agentConfig.model.fallbacks && agentConfig.model.fallbacks.length > 0 && (
                <div>
                  <span className="text-gray-500">Fallbacks:</span>
                  <div className="ml-2 mt-1 space-y-1">
                    {agentConfig.model.fallbacks.map((fallback: string, idx: number) => (
                      <div key={idx} className="font-mono text-gray-600 text-[10px]">
                        {idx + 1}. {fallback}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {claudeCodeStatus && (
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-gray-500">Claude Code:</span>
                  <div className="ml-2 mt-1">
                    <span className={`font-medium ${claudeCodeStatus.isActive ? 'text-purple-600' : 'text-gray-500'}`}>
                      {claudeCodeStatus.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {claudeCodeStatus.isActive && claudeCodeStatus.details && (
                      <div className="text-[10px] text-gray-500 mt-1">
                        Detection: {claudeCodeStatus.method}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
