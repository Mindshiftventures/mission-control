"use client";

import { useState } from "react";
import { 
  MagnifyingGlassIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ExclamationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

interface Skill {
  name: string;
  description: string;
  path: string;
  dependencies?: string[];
  status: "installed" | "missing" | "error";
  content?: string;
}

interface SkillsRegistryProps {
  skills: Skill[];
}

export function SkillsRegistry({ skills }: SkillsRegistryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [editingSkill, setEditingSkill] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [lastModified, setLastModified] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<Record<string, string>>({});

  const filteredSkills = skills.filter(
    (skill) =>
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "installed":
        return <CheckCircleIcon style={{ width: '20px', height: '20px', color: 'var(--accent-success)' }} />;
      case "missing":
        return <XCircleIcon style={{ width: '20px', height: '20px', color: 'var(--accent-error)' }} />;
      case "error":
        return <ExclamationCircleIcon style={{ width: '20px', height: '20px', color: 'var(--accent-warning)' }} />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      installed: { background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)' },
      missing: { background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-error)' },
      error: { background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-warning)' },
    };
    const style = styles[status as keyof typeof styles];
    
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
  
  const handleEditSkill = async (skillName: string, content: string) => {
    setEditingSkill(skillName);
    setEditedContent(content);
  };
  
  const handleSaveSkill = async (skillName: string) => {
    setSaveStatus({ ...saveStatus, [skillName]: "saving" });
    
    try {
      const res = await fetch(`/api/skills/${skillName}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editedContent })
      });
      
      if (res.ok) {
        const data = await res.json();
        setLastModified({ ...lastModified, [skillName]: data.lastModified });
        setSaveStatus({ ...saveStatus, [skillName]: "saved" });
        setEditingSkill(null);
        
        const skill = skills.find(s => s.name === skillName);
        if (skill) {
          skill.content = editedContent;
        }
        
        setTimeout(() => {
          setSaveStatus({ ...saveStatus, [skillName]: "" });
        }, 3000);
      } else {
        setSaveStatus({ ...saveStatus, [skillName]: "error" });
      }
    } catch (error) {
      console.error("Failed to save skill:", error);
      setSaveStatus({ ...saveStatus, [skillName]: "error" });
    }
  };
  
  const handleCancelEdit = (skillName: string) => {
    setEditingSkill(null);
    setEditedContent("");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Search */}
      <div style={{ position: 'relative' }}>
        <MagnifyingGlassIcon style={{
          position: 'absolute',
          left: '12px',
          top: '12px',
          width: '20px',
          height: '20px',
          color: 'var(--text-tertiary)',
        }} />
        <input
          type="text"
          placeholder="Search skills..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            paddingLeft: '40px',
            paddingRight: 'var(--space-4)',
            paddingTop: 'var(--space-2)',
            paddingBottom: 'var(--space-2)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--bg-border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            fontSize: 'var(--text-sm)',
          }}
        />
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-4)',
        fontSize: 'var(--text-sm)',
        color: 'var(--text-secondary)',
        fontFamily: 'var(--font-mono)',
      }}>
        <span>Total: {skills.length}</span>
        <span>Installed: {skills.filter(s => s.status === "installed").length}</span>
        {skills.filter(s => s.status === "error").length > 0 && (
          <span style={{ color: 'var(--accent-warning)' }}>
            Errors: {skills.filter(s => s.status === "error").length}
          </span>
        )}
      </div>

      {/* Skills List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {filteredSkills.map((skill) => (
          <div
            key={skill.path}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--bg-border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: 'var(--space-4)' }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 'var(--space-4)',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-3)',
                  flex: 1,
                }}>
                  {getStatusIcon(skill.status)}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      marginBottom: 'var(--space-1)',
                    }}>
                      <h3 style={{
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        fontSize: 'var(--text-base)',
                      }}>
                        {skill.name}
                      </h3>
                      {getStatusBadge(skill.status)}
                      
                      {saveStatus[skill.name] === "saved" && (
                        <span style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--accent-success)',
                        }}>
                          ✓ Saved
                        </span>
                      )}
                      {saveStatus[skill.name] === "error" && (
                        <span style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--accent-error)',
                        }}>
                          ✗ Error
                        </span>
                      )}
                    </div>
                    <p style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-secondary)',
                      marginBottom: 'var(--space-2)',
                    }}>
                      {skill.description}
                    </p>
                    <div style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-tertiary)',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {skill.path}
                    </div>
                    
                    {lastModified[skill.name] && (
                      <div style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text-tertiary)',
                        marginTop: 'var(--space-1)',
                      }}>
                        Last modified: {new Date(lastModified[skill.name]).toLocaleString()}
                      </div>
                    )}
                    
                    {skill.dependencies && skill.dependencies.length > 0 && (
                      <div style={{ marginTop: 'var(--space-2)' }}>
                        <div style={{
                          fontSize: 'var(--text-xs)',
                          fontWeight: 500,
                          color: 'var(--text-secondary)',
                          marginBottom: 'var(--space-1)',
                        }}>
                          Dependencies:
                        </div>
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 'var(--space-1)',
                        }}>
                          {skill.dependencies.map((dep, idx) => (
                            <span
                              key={idx}
                              style={{
                                padding: '2px var(--space-2)',
                                fontSize: 'var(--text-xs)',
                                background: 'var(--bg-tertiary)',
                                color: 'var(--text-secondary)',
                                borderRadius: 'var(--radius-sm)',
                                fontFamily: 'var(--font-mono)',
                              }}
                            >
                              {dep}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  {skill.content && editingSkill !== skill.name && (
                    <button
                      onClick={() => handleEditSkill(skill.name, skill.content!)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--accent-primary)',
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'color var(--transition-fast)',
                      }}
                      title="Edit skill"
                    >
                      <PencilIcon style={{ width: '20px', height: '20px' }} />
                    </button>
                  )}
                  
                  {skill.content && (
                    <button
                      onClick={() => setExpandedSkill(expandedSkill === skill.path ? null : skill.path)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-tertiary)',
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'color var(--transition-fast)',
                      }}
                    >
                      {expandedSkill === skill.path ? (
                        <ChevronUpIcon style={{ width: '20px', height: '20px' }} />
                      ) : (
                        <ChevronDownIcon style={{ width: '20px', height: '20px' }} />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {expandedSkill === skill.path && skill.content && (
                <div style={{
                  marginTop: 'var(--space-4)',
                  paddingTop: 'var(--space-4)',
                  borderTop: '1px solid var(--bg-border)',
                }}>
                  {editingSkill === skill.name ? (
                    <div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 'var(--space-2)',
                      }}>
                        <span style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 500,
                          color: 'var(--text-secondary)',
                        }}>
                          Editing {skill.name}
                        </span>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                          <button
                            onClick={() => handleSaveSkill(skill.name)}
                            disabled={saveStatus[skill.name] === "saving"}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 'var(--space-1)',
                              padding: 'var(--space-1) var(--space-3)',
                              fontSize: 'var(--text-sm)',
                              background: 'var(--accent-success)',
                              color: 'white',
                              border: 'none',
                              borderRadius: 'var(--radius-sm)',
                              cursor: saveStatus[skill.name] === "saving" ? 'not-allowed' : 'pointer',
                              opacity: saveStatus[skill.name] === "saving" ? 0.5 : 1,
                            }}
                          >
                            <CheckIcon style={{ width: '16px', height: '16px' }} />
                            {saveStatus[skill.name] === "saving" ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={() => handleCancelEdit(skill.name)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 'var(--space-1)',
                              padding: 'var(--space-1) var(--space-3)',
                              fontSize: 'var(--text-sm)',
                              background: 'var(--bg-tertiary)',
                              color: 'var(--text-primary)',
                              border: '1px solid var(--bg-border)',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                            }}
                          >
                            <XMarkIcon style={{ width: '16px', height: '16px' }} />
                            Cancel
                          </button>
                        </div>
                      </div>
                      <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        style={{
                          width: '100%',
                          height: '400px',
                          padding: 'var(--space-4)',
                          fontSize: 'var(--text-xs)',
                          fontFamily: 'var(--font-mono)',
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--bg-border)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-primary)',
                          resize: 'vertical',
                        }}
                      />
                    </div>
                  ) : (
                    <pre style={{
                      fontSize: 'var(--text-xs)',
                      background: 'var(--bg-primary)',
                      padding: 'var(--space-4)',
                      borderRadius: 'var(--radius-sm)',
                      overflowX: 'auto',
                      whiteSpace: 'pre-wrap',
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-mono)',
                      border: '1px solid var(--bg-border)',
                    }}>
                      {skill.content}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredSkills.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: 'var(--space-12)',
            color: 'var(--text-tertiary)',
            fontSize: 'var(--text-sm)',
          }}>
            No skills found matching &quot;{searchQuery}&quot;
          </div>
        )}
      </div>
    </div>
  );
}
