"use client";

import { useState } from "react";
import { 
  ClockIcon,
  PlayIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  MinusCircleIcon
} from "@heroicons/react/24/outline";

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  nextRun: string;
  lastRun: string;
  status: string;
  target: string;
  agent: string;
}

interface CronJobsProps {
  crons: CronJob[];
  onRefresh: () => void;
}

export function CronJobs({ crons, onRefresh }: CronJobsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [runningJobs, setRunningJobs] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<"all" | "ok" | "error" | "idle">("all");

  const filteredCrons = crons.filter((cron) => {
    const matchesSearch = 
      cron.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cron.schedule.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || cron.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleRunNow = async (cronId: string, cronName: string) => {
    if (runningJobs.has(cronId)) return;

    setRunningJobs(prev => new Set(prev).add(cronId));
    
    try {
      const res = await fetch("/api/crons/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cronId }),
      });

      if (!res.ok) throw new Error("Failed to run cron job");

      alert(`✅ ${cronName} triggered successfully!`);
      onRefresh();
    } catch (error) {
      alert(`❌ Failed to run ${cronName}`);
    } finally {
      setRunningJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(cronId);
        return newSet;
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ok":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "error":
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      case "idle":
        return <MinusCircleIcon className="h-5 w-5 text-gray-400" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      ok: "bg-green-100 text-green-800",
      error: "bg-red-100 text-red-800",
      idle: "bg-gray-100 text-gray-600",
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-600'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search cron jobs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <div className="flex gap-2">
          {["all", "ok", "error", "idle"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as typeof filterStatus)}
              className={`px-3 py-2 text-xs rounded-lg transition-colors ${
                filterStatus === status
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {status === "all" ? "All" : status}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm text-gray-600">
        <span>Total: {crons.length}</span>
        <span className="text-green-600">OK: {crons.filter(c => c.status === "ok").length}</span>
        <span className="text-red-600">Errors: {crons.filter(c => c.status === "error").length}</span>
        <span>Idle: {crons.filter(c => c.status === "idle").length}</span>
      </div>

      {/* Cron Jobs Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Run
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Run
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCrons.map((cron) => (
                <tr key={cron.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(cron.status)}
                      {getStatusBadge(cron.status)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{cron.name}</div>
                    <div className="text-xs text-gray-500 font-mono">{cron.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 font-mono">{cron.schedule}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{cron.nextRun}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{cron.lastRun}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                      {cron.target}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleRunNow(cron.id, cron.name)}
                      disabled={runningJobs.has(cron.id)}
                      className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                        runningJobs.has(cron.id)
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      }`}
                    >
                      {runningJobs.has(cron.id) ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600" />
                          Running...
                        </>
                      ) : (
                        <>
                          <PlayIcon className="h-4 w-4" />
                          Run Now
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCrons.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No cron jobs found
          </div>
        )}
      </div>
    </div>
  );
}
