"use client";

import { useState } from "react";
import type { Problem } from "@/lib/db/schema";

interface ProblemsKanbanProps {
  problems: Problem[];
  onProblemClick: (problem: Problem) => void;
  onRefresh: () => void;
}

const COLUMNS = [
  { id: "backlog", name: "Backlog", color: "bg-gray-100" },
  { id: "planning", name: "Planning", color: "bg-blue-100" },
  { id: "in_progress", name: "In Progress", color: "bg-yellow-100" },
  { id: "blocked", name: "Blocked", color: "bg-red-100" },
  { id: "review", name: "Review", color: "bg-purple-100" },
  { id: "done", name: "Done", color: "bg-green-100" },
];

const PRIORITY_COLORS = {
  0: "bg-gray-200 text-gray-700",
  1: "bg-yellow-200 text-yellow-800",
  2: "bg-red-200 text-red-800",
};

const PRIORITY_LABELS = {
  0: "Low",
  1: "Medium",
  2: "High",
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
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((column) => {
        const columnProblems = getProblemsByStatus(column.id);

        return (
          <div
            key={column.id}
            className="flex-shrink-0 w-80"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id)}
          >
            {/* Column Header */}
            <div className={`${column.color} rounded-t-lg px-4 py-3 border-b border-gray-300`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{column.name}</h3>
                <span className="text-sm font-medium text-gray-600">
                  {columnProblems.length}
                </span>
              </div>
            </div>

            {/* Column Body */}
            <div className="bg-gray-50 rounded-b-lg p-3 min-h-[500px] space-y-3">
              {columnProblems.map((problem) => (
                <div
                  key={problem.id}
                  draggable
                  onDragStart={() => handleDragStart(problem)}
                  onClick={() => onProblemClick(problem)}
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                >
                  {/* Title */}
                  <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                    {problem.title}
                  </h4>

                  {/* Description */}
                  {problem.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {problem.description}
                    </p>
                  )}

                  {/* Tags */}
                  {problem.tags && problem.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {problem.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                      {problem.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                          +{problem.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {/* Priority */}
                      <span
                        className={`px-2 py-1 rounded font-medium ${
                          PRIORITY_COLORS[problem.priority as keyof typeof PRIORITY_COLORS]
                        }`}
                      >
                        {PRIORITY_LABELS[problem.priority as keyof typeof PRIORITY_LABELS]}
                      </span>

                      {/* Owner */}
                      {problem.owner && (
                        <span className="text-gray-500">👤 {problem.owner}</span>
                      )}
                    </div>

                    {/* Assignee */}
                    {problem.assignee && (
                      <span className="text-gray-600 font-medium">
                        → {problem.assignee}
                      </span>
                    )}
                  </div>

                  {/* Blocked Indicator */}
                  {problem.status === "blocked" && problem.blockedReason && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-red-600">
                        🚫 {problem.blockedReason}
                      </p>
                    </div>
                  )}

                  {/* Telegram Badge */}
                  {problem.createdFromTelegram && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <span className="text-xs text-blue-600">📱 From Telegram</span>
                    </div>
                  )}
                </div>
              ))}

              {/* Empty State */}
              {columnProblems.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No items
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
