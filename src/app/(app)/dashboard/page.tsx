"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useTasks";
import { CalendarNav, MiniCalendar } from "@/components/CalendarNav";
import { TaskList } from "@/components/TaskList";
import { WeekView } from "@/components/WeekView";
import { MonthView } from "@/components/MonthView";
import { YearView } from "@/components/YearView";
import { WinsView } from "@/components/WinsView";
import type { CalendarView, TaskCategory } from "@/lib/types";

export default function DashboardPage() {
  const { user, loading: authLoading, error: authError, logout } = useAuth();
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("day");
  const [showWins, setShowWins] = useState(false);

  const {
    todoTasks,
    inProgressTasks,
    doneTasks,
    generalTasks,
    loading: tasksLoading,
    error: tasksError,
    clearError,
    addTask,
    updateTask,
    deleteTask,
    reorderTask,
    forwardTasks,
  } = useTasks(date);

  const displayError = authError || tasksError;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // Forward tasks on load
  useEffect(() => {
    forwardTasks();
  }, []);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Determine target category
    const categories: TaskCategory[] = ["TODO", "IN_PROGRESS", "DONE", "GENERAL"];
    let targetCategory: TaskCategory | undefined;

    if (categories.includes(overId as TaskCategory)) {
      targetCategory = overId as TaskCategory;
    } else {
      // Dropped on another task - find its category
      const allTasks = [...todoTasks, ...inProgressTasks, ...doneTasks, ...generalTasks];
      const overTask = allTasks.find((t) => t.id === overId);
      if (overTask) {
        targetCategory = overTask.category;
      }
    }

    if (targetCategory) {
      reorderTask(taskId, targetCategory, 0);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-muted">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-bg-card px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">Dorota</h1>
          <span className="text-text-muted text-sm hidden sm:inline">Task & Wins Tracker</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowWins(!showWins)}
            className={`px-3 py-1.5 text-sm rounded-lg border border-border transition-colors ${
              showWins ? "bg-important text-white border-important" : "hover:bg-bg-hover"
            }`}
          >
            ★ Wins
          </button>
          <span className="text-sm text-text-muted">{user.username}</span>
          <button
            onClick={logout}
            className="text-sm text-text-muted hover:text-danger transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {displayError && (
        <div className="bg-danger/10 border-b border-danger/20 px-6 py-2 flex items-center justify-between">
          <p className="text-danger text-sm">{displayError}</p>
          <button
            onClick={clearError}
            className="text-danger hover:text-danger/70 text-sm font-medium transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Calendar Navigation */}
        <div className="mb-6">
          <CalendarNav
            date={date}
            view={view}
            onDateChange={setDate}
            onViewChange={setView}
          />
        </div>

        {/* Wins Panel */}
        {showWins && (
          <div className="mb-6">
            <WinsView />
          </div>
        )}

        {/* View Content */}
        {view === "day" && (
          <div className="flex gap-6 flex-col lg:flex-row">
            {/* Sidebar */}
            <div className="lg:w-64 shrink-0 space-y-4">
              <MiniCalendar date={date} onDateChange={setDate} />

              {/* General Tasks */}
              <DndContext sensors={sensors} collisionDetection={closestCorners}>
                <TaskList
                  title="General"
                  category="GENERAL"
                  tasks={generalTasks}
                  colorClass="bg-text-muted"
                  onAdd={addTask}
                  onUpdate={updateTask}
                  onDelete={deleteTask}
                />
              </DndContext>
            </div>

            {/* Main Kanban */}
            <div className="flex-1 min-w-0">
              {tasksLoading ? (
                <div className="flex items-center justify-center py-20">
                  <p className="text-text-muted">Loading tasks...</p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCorners}
                  onDragEnd={handleDragEnd}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <TaskList
                      title="To Do"
                      category="TODO"
                      tasks={todoTasks}
                      colorClass="bg-todo"
                      onAdd={addTask}
                      onUpdate={updateTask}
                      onDelete={deleteTask}
                    />
                    <TaskList
                      title="In Progress"
                      category="IN_PROGRESS"
                      tasks={inProgressTasks}
                      colorClass="bg-in-progress"
                      onAdd={addTask}
                      onUpdate={updateTask}
                      onDelete={deleteTask}
                    />
                    <TaskList
                      title="Done"
                      category="DONE"
                      tasks={doneTasks}
                      colorClass="bg-done"
                      onAdd={addTask}
                      onUpdate={updateTask}
                      onDelete={deleteTask}
                    />
                  </div>
                </DndContext>
              )}
            </div>
          </div>
        )}

        {view === "week" && (
          <WeekView
            date={date}
            onDayClick={(d) => {
              setDate(d);
              setView("day");
            }}
          />
        )}

        {view === "month" && (
          <MonthView
            date={date}
            onDayClick={(d) => {
              setDate(d);
              setView("day");
            }}
          />
        )}

        {view === "year" && (
          <YearView
            date={date}
            onMonthClick={(d) => {
              setDate(d);
              setView("month");
            }}
          />
        )}
      </div>
    </div>
  );
}
