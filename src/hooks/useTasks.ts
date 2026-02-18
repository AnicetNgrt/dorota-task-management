"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import type { Task, TaskCategory } from "@/lib/types";

export function useTasks(date: Date) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [generalTasks, setGeneralTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const dateStr = format(date, "yyyy-MM-dd");

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const [dayRes, generalRes] = await Promise.all([
      fetch(`/api/tasks?date=${dateStr}`),
      fetch(`/api/tasks?category=GENERAL`),
    ]);
    const [dayData, generalData] = await Promise.all([
      dayRes.json(),
      generalRes.json(),
    ]);
    setTasks(dayData.tasks?.filter((t: Task) => t.category !== "GENERAL") ?? []);
    setGeneralTasks(generalData.tasks ?? []);
    setLoading(false);
  }, [dateStr]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = useCallback(
    async (title: string, category: TaskCategory, isImportant = false) => {
      const assignedDay = category === "GENERAL" ? "2000-01-01" : dateStr;
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, assignedDay, isImportant }),
      });
      if (res.ok) await fetchTasks();
    },
    [dateStr, fetchTasks]
  );

  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
      if (res.ok) await fetchTasks();
    },
    [fetchTasks]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const res = await fetch("/api/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) await fetchTasks();
    },
    [fetchTasks]
  );

  const reorderTask = useCallback(
    async (
      taskId: string,
      targetCategory: TaskCategory,
      newPosition: number
    ) => {
      const res = await fetch("/api/tasks/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, targetCategory, newPosition }),
      });
      if (res.ok) await fetchTasks();
    },
    [fetchTasks]
  );

  const forwardTasks = useCallback(async () => {
    const res = await fetch("/api/tasks/forward", { method: "POST" });
    if (res.ok) await fetchTasks();
    return res.ok;
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
    addTask,
    updateTask,
    deleteTask,
    reorderTask,
    forwardTasks,
    refetch: fetchTasks,
  };
}
