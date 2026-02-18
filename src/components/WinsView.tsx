"use client";

import { useState, useEffect } from "react";
import { format, subDays, subMonths, subYears } from "date-fns";
import type { Task } from "@/lib/types";

type WinsPeriod = "day" | "week" | "month" | "year";

export function WinsView() {
  const [period, setPeriod] = useState<WinsPeriod>("week");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWins() {
      setLoading(true);
      const now = new Date();
      let after: Date;
      switch (period) {
        case "day": after = subDays(now, 1); break;
        case "week": after = subDays(now, 7); break;
        case "month": after = subMonths(now, 1); break;
        case "year": after = subYears(now, 1); break;
      }

      const params = new URLSearchParams({
        important: "true",
        completedAfter: format(after, "yyyy-MM-dd"),
        completedBefore: format(now, "yyyy-MM-dd"),
      });

      const res = await fetch(`/api/tasks?${params}`);
      const data = await res.json();
      setTasks(data.tasks ?? []);
      setLoading(false);
    }
    fetchWins();
  }, [period]);

  const periods: { key: WinsPeriod; label: string }[] = [
    { key: "day", label: "Last 24h" },
    { key: "week", label: "Last week" },
    { key: "month", label: "Last month" },
    { key: "year", label: "Last year" },
  ];

  return (
    <div className="bg-bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <span className="text-important">★</span> Important Wins
        </h3>
        <div className="flex gap-1">
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-2 py-0.5 text-xs rounded transition-colors ${
                period === p.key
                  ? "bg-accent text-white"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-text-muted text-xs text-center py-4">Loading...</p>
      ) : tasks.length === 0 ? (
        <p className="text-text-muted text-xs text-center py-4">No important wins in this period</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-hover text-sm"
            >
              <span className="text-done">&#10003;</span>
              <span className="flex-1">{task.title}</span>
              {task.completedAt && (
                <span className="text-text-muted text-xs">
                  {format(new Date(task.completedAt), "MMM d")}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
