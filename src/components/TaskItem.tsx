"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/lib/types";

interface TaskItemProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  isDraggable?: boolean;
}

export function TaskItem({ task, onUpdate, onDelete, isDraggable = true }: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: !isDraggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  function handleCheck() {
    if (task.category === "GENERAL") {
      onUpdate(task.id, { isCompleted: !task.isCompleted });
    } else if (task.category === "DONE") {
      onUpdate(task.id, { category: "TODO" });
    } else {
      onUpdate(task.id, { category: "DONE" });
    }
  }

  function handleTitleSave() {
    if (title.trim() && title !== task.title) {
      onUpdate(task.id, { title: title.trim() });
    }
    setEditing(false);
  }

  const isChecked = task.category === "DONE" || (task.category === "GENERAL" && task.isCompleted);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-bg-card hover:bg-bg-hover transition-colors ${
        isDragging ? "shadow-lg" : ""
      }`}
    >
      {isDraggable && (
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-text-muted hover:text-text-primary shrink-0 touch-none"
          aria-label="Drag to reorder"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <circle cx="3" cy="2" r="1.2" />
            <circle cx="9" cy="2" r="1.2" />
            <circle cx="3" cy="6" r="1.2" />
            <circle cx="9" cy="6" r="1.2" />
            <circle cx="3" cy="10" r="1.2" />
            <circle cx="9" cy="10" r="1.2" />
          </svg>
        </button>
      )}

      <button
        onClick={handleCheck}
        className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          isChecked
            ? "bg-done border-done text-white"
            : "border-border hover:border-accent"
        }`}
      >
        {isChecked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 4L3.5 6.5L9 1" />
          </svg>
        )}
      </button>

      {editing ? (
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleTitleSave();
            if (e.key === "Escape") { setTitle(task.title); setEditing(false); }
          }}
          className="flex-1 bg-transparent border-none outline-none text-sm"
        />
      ) : (
        <span
          onDoubleClick={() => setEditing(true)}
          className={`flex-1 text-sm select-none ${
            isChecked ? "line-through text-text-muted" : ""
          }`}
        >
          {task.title}
        </span>
      )}

      {task.isImportant && (
        <span className="text-important text-xs font-bold shrink-0" title="Important">
          ★
        </span>
      )}

      <div className="hidden group-hover:flex items-center gap-1 shrink-0">
        <button
          onClick={() => onUpdate(task.id, { isImportant: !task.isImportant })}
          className={`p-1 rounded text-xs transition-colors ${
            task.isImportant
              ? "text-important hover:text-text-muted"
              : "text-text-muted hover:text-important"
          }`}
          title="Toggle important"
        >
          ★
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-1 rounded text-text-muted hover:text-danger text-xs transition-colors"
          title="Delete"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
