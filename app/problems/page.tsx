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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
          <p className="text-gray-600">Loading problems...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg">
          <h2 className="text-red-800 font-semibold mb-2">Error Loading Problems</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchProblems}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Problems & Projects</h1>
              <p className="text-sm text-gray-500 mt-1">
                Track ideas, projects, and problems
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Filter Dropdown */}
              <select
                value={filter.owner || ""}
                onChange={(e) => setFilter({ ...filter, owner: e.target.value || undefined })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Owners</option>
                <option value="birju">Birju</option>
                <option value="lyra">Lyra</option>
                <option value="shared">Shared</option>
              </select>

              <button
                onClick={() => setShowCreateDialog(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                + New Problem
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
