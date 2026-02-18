"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import type { Task, TaskCategory } from "@/lib/types";

export function useTasks(date: Date) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [generalTasks, setGeneralTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dateStr = format(date, "yyyy-MM-dd");

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dayRes, generalRes] = await Promise.all([
        fetch(`/api/tasks?date=${dateStr}`),
        fetch(`/api/tasks?category=GENERAL`),
      ]);
      if (!dayRes.ok || !generalRes.ok) {
        setError("Failed to load tasks");
        return;
      }
      const [dayData, generalData] = await Promise.all([
        dayRes.json(),
        generalRes.json(),
      ]);
      setTasks(dayData.tasks?.filter((t: Task) => t.category !== "GENERAL") ?? []);
      setGeneralTasks(generalData.tasks ?? []);
    } catch {
      setError("Network error loading tasks");
    } finally {
      setLoading(false);
    }
  }, [dateStr]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = useCallback(
    async (title: string, category: TaskCategory, isImportant = false) => {
      const assignedDay = category === "GENERAL" ? "2000-01-01" : dateStr;
      try {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, category, assignedDay, isImportant }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "Failed to add task");
          return;
        }
        await fetchTasks();
      } catch {
        setError("Network error adding task");
      }
    },
    [dateStr, fetchTasks]
  );

  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      try {
        const res = await fetch("/api/tasks", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, ...updates }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "Failed to update task");
          return;
        }
        await fetchTasks();
      } catch {
        setError("Network error updating task");
      }
    },
    [fetchTasks]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      try {
        const res = await fetch("/api/tasks", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "Failed to delete task");
          return;
        }
        await fetchTasks();
      } catch {
        setError("Network error deleting task");
      }
    },
    [fetchTasks]
  );

  const reorderTask = useCallback(
    async (
      taskId: string,
      targetCategory: TaskCategory,
      newPosition: number
    ) => {
      try {
        const res = await fetch("/api/tasks/reorder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId, targetCategory, newPosition }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "Failed to move task");
          return;
        }
        await fetchTasks();
      } catch {
        setError("Network error moving task");
      }
    },
    [fetchTasks]
  );

  const forwardTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks/forward", { method: "POST" });
      if (res.ok) await fetchTasks();
      return res.ok;
    } catch {
      return false;
    }
  }, [fetchTasks]);

  const todoTasks = tasks.filter((t) => t.category === "TODO");
  const inProgressTasks = tasks.filter((t) => t.category === "IN_PROGRESS");
  const doneTasks = tasks.filter((t) => t.category === "DONE");

  return {
    tasks,
    todoTasks,
    inProgressTasks,
    doneTasks,
    generalTasks,
    loading,
    error,
    clearError: () => setError(null),
    addTask,
    updateTask,
    deleteTask,
    reorderTask,
    forwardTasks,
    refetch: fetchTasks,
  };
}
