"use client";

import { useState, useEffect } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isToday,
  isSameMonth,
} from "date-fns";
import type { Task } from "@/lib/types";

interface MonthViewProps {
  date: Date;
  onDayClick: (date: Date) => void;
}

export function MonthView({ date, onDayClick }: MonthViewProps) {
  const [taskCounts, setTaskCounts] = useState<Record<string, { todo: number; ip: number; done: number; important: number }>>({});

  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  useEffect(() => {
    async function fetchMonth() {
      const counts: typeof taskCounts = {};
      const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
      await Promise.all(
        daysInMonth.map(async (day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const res = await fetch(`/api/tasks?date=${dateStr}`);
          const data = await res.json();
          const tasks: Task[] = data.tasks?.filter((t: Task) => t.category !== "GENERAL") ?? [];
          counts[dateStr] = {
            todo: tasks.filter((t) => t.category === "TODO").length,
            ip: tasks.filter((t) => t.category === "IN_PROGRESS").length,
            done: tasks.filter((t) => t.category === "DONE").length,
            important: tasks.filter((t) => t.isImportant).length,
          };
        })
      );
      setTaskCounts(counts);
    }
    fetchMonth();
  }, [date.getMonth(), date.getFullYear()]);

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="text-xs text-text-muted font-medium text-center py-2">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const inMonth = isSameMonth(day, date);
          const today = isToday(day);
          const c = taskCounts[dateStr];

          return (
            <button
              key={dateStr}
              onClick={() => onDayClick(day)}
              className={`flex flex-col items-start p-2 rounded-lg border border-border min-h-[80px] transition-colors text-left ${
                !inMonth ? "opacity-30" : "hover:bg-bg-hover"
              } ${today ? "ring-2 ring-accent" : ""}`}
            >
              <span className={`text-xs font-medium ${today ? "text-accent" : ""}`}>
                {format(day, "d")}
              </span>
              {c && (c.todo + c.ip + c.done) > 0 && (
                <div className="flex gap-0.5 mt-1 flex-wrap">
                  {c.todo > 0 && <span className="w-1.5 h-1.5 rounded-full bg-todo" />}
                  {c.ip > 0 && <span className="w-1.5 h-1.5 rounded-full bg-in-progress" />}
                  {c.done > 0 && <span className="w-1.5 h-1.5 rounded-full bg-done" />}
                  {c.important > 0 && <span className="text-important text-[8px]">★</span>}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
