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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-12rem)]">
      {/* File Browser */}
      <div className="lg:col-span-1 bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 space-y-3">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            {["all", "core", "memory"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type as typeof filterType)}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  filterType === type
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {type === "all" ? "All" : type === "core" ? "Core" : "Memory"}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="text-xs text-gray-500">
            {filteredFiles.length} files
          </div>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto">
          {filteredFiles.map((file) => (
            <button
              key={file.path}
              onClick={() => loadFile(file)}
              className={`w-full text-left p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                selectedFile?.path === file.path ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex items-start gap-2">
                {file.type === "core" ? (
                  <DocumentIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <FolderIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">
                    {file.name}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <ClockIcon className="h-3 w-3" />
                    <span>{formatDate(file.modified)}</span>
                    <span>•</span>
                    <span>{formatFileSize(file.size)}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}

          {filteredFiles.length === 0 && (
            <div className="p-6 text-center text-gray-500 text-sm">
              No files found
            </div>
          )}
        </div>
      </div>

      {/* Preview Pane */}
      <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
        {selectedFile ? (
          <>
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">{selectedFile.name}</h3>
              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                <span>{formatFileSize(selectedFile.size)}</span>
                <span>Modified {formatDate(selectedFile.modified)}</span>
                <span className="px-2 py-0.5 bg-gray-100 rounded">{selectedFile.type}</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              ) : (
                <pre className="text-sm whitespace-pre-wrap font-mono text-gray-800">
                  {fileContent}
                </pre>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <DocumentIcon className="h-16 w-16 mx-auto mb-4" />
              <p>Select a file to preview</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
