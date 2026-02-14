"use client";

import { useState } from "react";
import { 
  MagnifyingGlassIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ExclamationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon
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

  const filteredSkills = skills.filter(
    (skill) =>
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "installed":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "missing":
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case "error":
        return <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      installed: "bg-green-100 text-green-800",
      missing: "bg-red-100 text-red-800",
      error: "bg-yellow-100 text-yellow-800",
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status as keyof typeof colors]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search skills..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm text-gray-600">
        <span>Total: {skills.length}</span>
        <span>Installed: {skills.filter(s => s.status === "installed").length}</span>
        {skills.filter(s => s.status === "error").length > 0 && (
          <span className="text-yellow-600">
            Errors: {skills.filter(s => s.status === "error").length}
          </span>
        )}
      </div>

      {/* Skills List */}
      <div className="space-y-2">
        {filteredSkills.map((skill) => (
          <div key={skill.path} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  {getStatusIcon(skill.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                      {getStatusBadge(skill.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{skill.description}</p>
                    <div className="text-xs text-gray-500 font-mono">{skill.path}</div>
                    
                    {skill.dependencies && skill.dependencies.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs font-medium text-gray-700 mb-1">Dependencies:</div>
                        <div className="flex flex-wrap gap-1">
                          {skill.dependencies.map((dep, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded font-mono"
                            >
                              {dep}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {skill.content && (
                  <button
                    onClick={() => setExpandedSkill(expandedSkill === skill.path ? null : skill.path)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {expandedSkill === skill.path ? (
                      <ChevronUpIcon className="h-5 w-5" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5" />
                    )}
                  </button>
                )}
              </div>

              {/* Expanded Content */}
              {expandedSkill === skill.path && skill.content && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                    {skill.content}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredSkills.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No skills found matching &quot;{searchQuery}&quot;
          </div>
        )}
      </div>
    </div>
  );
}
