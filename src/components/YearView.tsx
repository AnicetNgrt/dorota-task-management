"use client";

import {
  startOfYear,
  eachMonthOfInterval,
  endOfYear,
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  isSameMonth,
} from "date-fns";

interface YearViewProps {
  date: Date;
  onMonthClick: (date: Date) => void;
}

export function YearView({ date, onMonthClick }: YearViewProps) {
  const yearStart = startOfYear(date);
  const yearEnd = endOfYear(date);
  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
      {months.map((month) => {
        const mStart = startOfMonth(month);
        const mEnd = endOfMonth(month);
        const calStart = startOfWeek(mStart, { weekStartsOn: 1 });
        const calEnd = endOfWeek(mEnd, { weekStartsOn: 1 });
        const days = eachDayOfInterval({ start: calStart, end: calEnd });
        const current = isSameMonth(month, new Date());

        return (
          <button
            key={month.toISOString()}
            onClick={() => onMonthClick(month)}
            className={`p-3 rounded-xl border border-border bg-bg-card hover:bg-bg-hover transition-colors text-left ${
              current ? "ring-2 ring-accent" : ""
            }`}
          >
            <h4 className="text-sm font-medium mb-2">{format(month, "MMMM")}</h4>
            <div className="grid grid-cols-7 gap-px text-center">
              {days.slice(0, 42).map((day) => {
                const inMonth = isSameMonth(day, month);
                const today = isToday(day);
                return (
                  <span
                    key={day.toISOString()}
                    className={`text-[8px] leading-4 ${
                      !inMonth ? "opacity-0" : today ? "text-accent font-bold" : "text-text-muted"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                );
              })}
            </div>
          </button>
        );
      })}
    </div>
  );
}
