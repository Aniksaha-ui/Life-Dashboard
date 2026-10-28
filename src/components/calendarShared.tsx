import React from "react";
import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  setMonth as setMonthIndex,
  setYear,
  parseISO,
  getDate,
  lastDayOfMonth,
} from "date-fns";

export const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export const MONTHS = Array.from({ length: 12 }, (_, index) => ({
  value: index,
  label: format(new Date(2000, index, 1), "MMMM"),
}));

export const buildYearOptions = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 41 }, (_, index) => currentYear - 20 + index);
};

export function buildCalendarDays(month: Date): Date[] {
  const start = startOfWeek(startOfMonth(month));
  const end = endOfWeek(endOfMonth(month));
  const days: Date[] = [];
  let current = start;
  while (current <= end) {
    days.push(current);
    current = addDays(current, 1);
  }
  return days;
}

export function CalendarSelect({
  value,
  options,
  onChange,
  isOpen,
  onToggle,
  className,
}: {
  value: number;
  options: { value: number; label: string }[];
  onChange: (value: number) => void;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}) {
  const selected = options.find((option) => option.value === value);

  return (
    <div className={clsx("relative", className)}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={clsx(
          "flex h-8 w-full items-center rounded-md border bg-white pl-2.5 pr-2 text-left text-xs font-semibold transition-all cursor-pointer",
          isOpen
            ? "border-primary-500 ring-2 ring-primary-500/20 text-slate-800"
            : "border-slate-200 text-slate-800 hover:border-slate-300",
        )}
      >
        <span className="min-w-0 flex-1 truncate">{selected?.label}</span>
        <ChevronDown
          className={clsx(
            "ml-2 h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-[60] mt-1 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg animate-in fade-in zoom-in-95 duration-150 custom-scrollbar">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(option.value);
              }}
              className={clsx(
                "w-full px-3 py-2 text-left text-xs font-medium transition-colors cursor-pointer",
                value === option.value
                  ? "bg-primary-50 text-primary-700 font-semibold"
                  : "text-slate-700 hover:bg-slate-50",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function updateCalendarMonth(
  month: Date,
  monthValue?: number,
  yearValue?: number,
) {
  let nextMonth = month;
  if (monthValue !== undefined) {
    nextMonth = setMonthIndex(nextMonth, monthValue);
  }
  if (yearValue !== undefined) {
    nextMonth = setYear(nextMonth, yearValue);
  }
  return startOfMonth(nextMonth);
}

export function updateDatePreserveDay(
  isoDate: string,
  targetMonth: Date,
): string {
  const current = parseISO(isoDate);
  const day = Math.min(getDate(current), getDate(lastDayOfMonth(targetMonth)));
  const updated = new Date(
    targetMonth.getFullYear(),
    targetMonth.getMonth(),
    day,
  );

  return format(updated, "yyyy-MM-dd");
}
