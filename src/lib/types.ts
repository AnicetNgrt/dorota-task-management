export type TaskCategory = "TODO" | "IN_PROGRESS" | "DONE" | "GENERAL";

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  isImportant: boolean;
  isCompleted: boolean;
  assignedDay: string;
  completedAt: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export type CalendarView = "day" | "week" | "month" | "year";

export interface User {
  id: string;
  username: string;
}
