"use client";

import {
  format,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  addYears,
  subYears,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
} from "date-fns";
import type { CalendarView } from "@/lib/types";

interface CalendarNavProps {
  date: Date;
  view: CalendarView;
  onDateChange: (date: Date) => void;
  onViewChange: (view: CalendarView) => void;
}

export function CalendarNav({ date, view, onDateChange, onViewChange }: CalendarNavProps) {
  function goBack() {
    switch (view) {
      case "day": onDateChange(subDays(date, 1)); break;
      case "week": onDateChange(subWeeks(date, 1)); break;
      case "month": onDateChange(subMonths(date, 1)); break;
      case "year": onDateChange(subYears(date, 1)); break;
    }
  }

  function goForward() {
    switch (view) {
      case "day": onDateChange(addDays(date, 1)); break;
      case "week": onDateChange(addWeeks(date, 1)); break;
      case "month": onDateChange(addMonths(date, 1)); break;
      case "year": onDateChange(addYears(date, 1)); break;
    }
  }

  function goToday() {
    onDateChange(new Date());
  }

  function getLabel() {
    switch (view) {
      case "day": return format(date, "EEEE, MMMM d, yyyy");
      case "week": {
        const start = startOfWeek(date, { weekStartsOn: 1 });
        const end = endOfWeek(date, { weekStartsOn: 1 });
        return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
      }
      case "month": return format(date, "MMMM yyyy");
      case "year": return format(date, "yyyy");
    }
  }

  const views: CalendarView[] = ["day", "week", "month", "year"];

  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-2">
        <button
          onClick={goBack}
          className="p-2 rounded-lg border border-border hover:bg-bg-hover transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 2L4 7L9 12" />
          </svg>
        </button>
        <button
          onClick={goToday}
          className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-bg-hover transition-colors"
        >
          Today
        </button>
        <button
          onClick={goForward}
          className="p-2 rounded-lg border border-border hover:bg-bg-hover transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 2L10 7L5 12" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold ml-2">{getLabel()}</h2>
      </div>

      <div className="flex items-center gap-1 bg-bg-card border border-border rounded-lg p-0.5">
        {views.map((v) => (
          <button
            key={v}
            onClick={() => onViewChange(v)}
            className={`px-3 py-1 text-sm rounded-md transition-colors capitalize ${
              view === v
                ? "bg-accent text-white"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

interface MiniCalendarProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

export function MiniCalendar({ date, onDateChange }: MiniCalendarProps) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  return (
    <div className="bg-bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => onDateChange(subMonths(date, 1))}
          className="p-1 hover:bg-bg-hover rounded transition-colors text-text-muted"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 1L3 6L8 11" />
          </svg>
        </button>
        <span className="text-sm font-medium">{format(date, "MMMM yyyy")}</span>
        <button
          onClick={() => onDateChange(addMonths(date, 1))}
          className="p-1 hover:bg-bg-hover rounded transition-colors text-text-muted"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 1L9 6L4 11" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
          <div key={d} className="text-[10px] text-text-muted font-medium py-1">
            {d}
          </div>
        ))}
        {days.map((day) => {
          const inMonth = day.getMonth() === date.getMonth();
          const selected = isSameDay(day, date);
          const today = isToday(day);
          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateChange(day)}
              className={`text-xs py-1 rounded transition-colors ${
                selected
                  ? "bg-accent text-white"
                  : today
                  ? "bg-accent/10 text-accent font-medium"
                  : inMonth
                  ? "hover:bg-bg-hover"
                  : "text-text-muted/40 hover:bg-bg-hover"
              }`}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
