"use client";

import { useState, useEffect } from "react";
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isToday,
} from "date-fns";
import type { Task } from "@/lib/types";

interface WeekViewProps {
  date: Date;
  onDayClick: (date: Date) => void;
}

export function WeekView({ date, onDayClick }: WeekViewProps) {
  const [tasksByDay, setTasksByDay] = useState<Record<string, Task[]>>({});

  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  useEffect(() => {
    async function fetchWeek() {
      const results: Record<string, Task[]> = {};
      await Promise.all(
        days.map(async (day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const res = await fetch(`/api/tasks?date=${dateStr}`);
          const data = await res.json();
          results[dateStr] = data.tasks?.filter((t: Task) => t.category !== "GENERAL") ?? [];
        })
      );
      setTasksByDay(results);
    }
    fetchWeek();
  }, [date.toISOString()]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
      {days.map((day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const dayTasks = tasksByDay[dateStr] ?? [];
        const todoCount = dayTasks.filter((t) => t.category === "TODO").length;
        const ipCount = dayTasks.filter((t) => t.category === "IN_PROGRESS").length;
        const doneCount = dayTasks.filter((t) => t.category === "DONE").length;
        const today = isToday(day);

        return (
          <button
            key={dateStr}
            onClick={() => onDayClick(day)}
            className={`flex flex-col p-3 rounded-xl border border-border bg-bg-card hover:bg-bg-hover transition-colors text-left min-h-[140px] ${
              today ? "ring-2 ring-accent" : ""
            }`}
          >
            <span className={`text-sm font-medium mb-2 ${today ? "text-accent" : ""}`}>
              {format(day, "EEE d")}
            </span>
            <div className="flex flex-col gap-1 text-xs">
              {todoCount > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-todo" />
                  {todoCount} todo
                </span>
              )}
              {ipCount > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-in-progress" />
                  {ipCount} in progress
                </span>
              )}
              {doneCount > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-done" />
                  {doneCount} done
                </span>
              )}
            </div>
            {dayTasks.filter((t) => t.isImportant).length > 0 && (
              <span className="text-important text-xs mt-auto">
                ★ {dayTasks.filter((t) => t.isImportant).length} important
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
