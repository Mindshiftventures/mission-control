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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
        </div>
      </div>
    );
  }

  if (!problem) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Problem Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Edit Mode */}
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="0">Low</option>
                    <option value="1">Medium</option>
                    <option value="2">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Owner
                  </label>
                  <select
                    value={formData.owner || ""}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">None</option>
                    <option value="birju">Birju</option>
                    <option value="lyra">Lyra</option>
                    <option value="shared">Shared</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assignee
                  </label>
                  <select
                    value={formData.assignee || ""}
                    onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">None</option>
                    <option value="birju">Birju</option>
                    <option value="lyra">Lyra</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormData(problem);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{problem.title}</h3>
                  <p className="text-gray-600">{problem.description}</p>
                </div>
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ml-4"
                >
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Status:</span>{" "}
                  <span className="text-gray-900">{problem.status}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Priority:</span>{" "}
                  <span className="text-gray-900">
                    {problem.priority === 0 ? "Low" : problem.priority === 1 ? "Medium" : "High"}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Owner:</span>{" "}
                  <span className="text-gray-900">{problem.owner || "None"}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Assignee:</span>{" "}
                  <span className="text-gray-900">{problem.assignee || "None"}</span>
                </div>
              </div>

              {problem.tags && problem.tags.length > 0 && (
                <div>
                  <span className="font-medium text-gray-700 text-sm">Tags:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {problem.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
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
            <h4 className="font-semibold text-gray-900 mb-3">Comments ({problem.comments.length})</h4>
            <div className="space-y-3 mb-4">
              {problem.comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{comment.author}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
              />
              <button
                onClick={handleAddComment}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Attachments */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Attachments ({problem.attachments.length})</h4>
            <div className="space-y-2 mb-4">
              {problem.attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">🔗</span>
                    <span className="text-gray-900">{attachment.title || attachment.url}</span>
                  </div>
                </a>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newAttachmentUrl}
                onChange={(e) => setNewAttachmentUrl(e.target.value)}
                placeholder="Add attachment URL..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === "Enter" && handleAddAttachment()}
              />
              <button
                onClick={handleAddAttachment}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Activity Log */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Activity</h4>
            <div className="space-y-2">
              {problem.activity.map((activity) => (
                <div key={activity.id} className="text-sm text-gray-600">
                  <span className="font-medium">{activity.action}</span>
                  {activity.oldValue && activity.newValue && (
                    <>
                      {" "}
                      from <span className="font-medium">{activity.oldValue}</span> to{" "}
                      <span className="font-medium">{activity.newValue}</span>
                    </>
                  )}
                  {!activity.oldValue && activity.newValue && (
                    <> - {activity.newValue}</>
                  )}
                  <span className="text-gray-400 ml-2">
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
