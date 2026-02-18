"use client";

import { useState } from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { TaskItem } from "./TaskItem";
import type { Task, TaskCategory } from "@/lib/types";

interface TaskListProps {
  title: string;
  category: TaskCategory;
  tasks: Task[];
  colorClass: string;
  onAdd: (title: string, category: TaskCategory, isImportant?: boolean) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

export function TaskList({
  title,
  category,
  tasks,
  colorClass,
  onAdd,
  onUpdate,
  onDelete,
}: TaskListProps) {
  const [newTitle, setNewTitle] = useState("");
  const [showInput, setShowInput] = useState(false);

  const { setNodeRef, isOver } = useDroppable({ id: category });

  function handleAdd() {
    if (newTitle.trim()) {
      onAdd(newTitle.trim(), category);
      setNewTitle("");
      setShowInput(false);
    }
  }

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-2 p-3 rounded-xl border border-border bg-bg-card min-h-[120px] transition-colors ${
        isOver ? "ring-2 ring-accent ring-opacity-50" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${colorClass}`} />
          {title}
          <span className="text-text-muted font-normal">({tasks.length})</span>
        </h3>
        {category !== "DONE" && (
          <button
            onClick={() => setShowInput(true)}
            className="text-text-muted hover:text-accent text-lg leading-none transition-colors"
            title="Add task"
          >
            +
          </button>
        )}
      </div>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-1.5">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>

      {showInput && (
        <div className="flex gap-2 mt-1">
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") { setNewTitle(""); setShowInput(false); }
            }}
            placeholder="Task name..."
            className="flex-1 px-3 py-1.5 text-sm border border-border rounded-lg bg-bg-card focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            onClick={handleAdd}
            className="px-3 py-1.5 text-sm bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
          >
            Add
          </button>
        </div>
      )}

      {tasks.length === 0 && !showInput && (
        <p className="text-text-muted text-xs text-center py-4">No tasks</p>
      )}
    </div>
  );
}
