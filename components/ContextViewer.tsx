"use client";

import { useState } from "react";
import { 
  MagnifyingGlassIcon,
  DocumentIcon,
  FolderIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

interface ContextFile {
  name: string;
  path: string;
  type: "core" | "memory";
  size: number;
  modified: number;
}

interface ContextViewerProps {
  files: ContextFile[];
}

export function ContextViewer({ files }: ContextViewerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<ContextFile | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "core" | "memory">("all");

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || file.type === filterType;
    return matchesSearch && matchesType;
  });

  const loadFile = async (file: ContextFile) => {
    setSelectedFile(file);
    setLoading(true);
    try {
      const res = await fetch(`/api/context/file?path=${encodeURIComponent(file.path)}`);
      if (!res.ok) throw new Error("Failed to load file");
      const data = await res.json();
      setFileContent(data.content);
    } catch (error) {
      setFileContent("Error loading file content");
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: 'var(--space-4)',
      height: 'calc(100vh - 12rem)',
    }}>
      <style jsx>{`
        @media (min-width: 1024px) {
          div {
            grid-template-columns: 1fr 2fr;
          }
        }
      `}</style>
      
      {/* File Browser */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--bg-border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          padding: 'var(--space-4)',
          borderBottom: '1px solid var(--bg-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <MagnifyingGlassIcon style={{
              position: 'absolute',
              left: '12px',
              top: '10px',
              width: '20px',
              height: '20px',
              color: 'var(--text-tertiary)',
            }} />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '40px',
                paddingRight: 'var(--space-4)',
                paddingTop: 'var(--space-2)',
                paddingBottom: 'var(--space-2)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--bg-border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-sm)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Filter */}
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {(["all", "core", "memory"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                style={{
                  padding: 'var(--space-1) var(--space-3)',
                  fontSize: 'var(--text-xs)',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: filterType === type ? 500 : 400,
                  background: filterType === type ? 'rgba(0, 212, 255, 0.1)' : 'var(--bg-tertiary)',
                  color: filterType === type ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {type === "all" ? "All" : type === "core" ? "Core" : "Memory"}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-mono)',
          }}>
            {filteredFiles.length} files
          </div>
        </div>

        {/* File List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredFiles.map((file) => (
            <button
              key={file.path}
              onClick={() => loadFile(file)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: 'var(--space-3)',
                borderBottom: '1px solid var(--bg-border)',
                background: selectedFile?.path === file.path ? 'var(--bg-tertiary)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                if (selectedFile?.path !== file.path) {
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedFile?.path !== file.path) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                {file.type === "core" ? (
                  <DocumentIcon style={{
                    width: '20px',
                    height: '20px',
                    color: 'var(--accent-info)',
                    flexShrink: 0,
                    marginTop: '2px',
                  }} />
                ) : (
                  <FolderIcon style={{
                    width: '20px',
                    height: '20px',
                    color: 'var(--text-tertiary)',
                    flexShrink: 0,
                    marginTop: '2px',
                  }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 500,
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {file.name}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    marginTop: 'var(--space-1)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-tertiary)',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    <ClockIcon style={{ width: '12px', height: '12px' }} />
                    <span>{formatDate(file.modified)}</span>
                    <span>•</span>
                    <span>{formatFileSize(file.size)}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}

          {filteredFiles.length === 0 && (
            <div style={{
              padding: 'var(--space-6)',
              textAlign: 'center',
              color: 'var(--text-tertiary)',
              fontSize: 'var(--text-sm)',
            }}>
              No files found
            </div>
          )}
        </div>
      </div>

      {/* Preview Pane */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--bg-border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {selectedFile ? (
          <>
            <div style={{
              padding: 'var(--space-4)',
              borderBottom: '1px solid var(--bg-border)',
            }}>
              <h3 style={{
                fontWeight: 600,
                color: 'var(--text-primary)',
                fontSize: 'var(--text-base)',
              }}>
                {selectedFile.name}
              </h3>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-4)',
                marginTop: 'var(--space-1)',
                fontSize: 'var(--text-xs)',
                color: 'var(--text-tertiary)',
                fontFamily: 'var(--font-mono)',
              }}>
                <span>{formatFileSize(selectedFile.size)}</span>
                <span>Modified {formatDate(selectedFile.modified)}</span>
                <span style={{
                  padding: '2px var(--space-2)',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-sm)',
                }}>
                  {selectedFile.type}
                </span>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4)' }}>
              {loading ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    border: '2px solid var(--bg-border)',
                    borderTopColor: 'var(--accent-primary)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }} />
                  <style jsx>{`
                    @keyframes spin {
                      to { transform: rotate(360deg); }
                    }
                  `}</style>
                </div>
              ) : (
                <pre style={{
                  fontSize: 'var(--text-sm)',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.6',
                }}>
                  {fileContent}
                </pre>
              )}
            </div>
          </>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--text-tertiary)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <DocumentIcon style={{
                width: '64px',
                height: '64px',
                margin: '0 auto var(--space-4)',
              }} />
              <p style={{ fontSize: 'var(--text-sm)' }}>Select a file to preview</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
