import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { clsx } from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  startOfMonth,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  parseISO,
} from "date-fns";
import {
  WEEKDAYS,
  MONTHS,
  buildYearOptions,
  buildCalendarDays,
  CalendarSelect,
  updateCalendarMonth,
  updateDatePreserveDay,
} from "./calendarShared";

interface DatePickerProps {
  label?: string;
  value: string; // ISO yyyy-MM-dd
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  usePortal?: boolean;
  placement?: "up" | "down" | "auto";
}

export function DatePicker({
  label,
  value,
  onChange,
  placeholder = "Select date",
  className,
  error,
  usePortal = false,
  placement = "auto",
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [activeSelect, setActiveSelect] = useState<"month" | "year" | null>(
    null,
  );
  const [portalCoords, setPortalCoords] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [month, setMonth] = useState<Date>(() => {
    if (value) return startOfMonth(parseISO(value));
    return startOfMonth(new Date());
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const selectedDate = value ? parseISO(value) : null;
  const today = new Date();
  const days = buildCalendarDays(month);
  const yearOptions = buildYearOptions().map((year) => ({
    value: year,
    label: String(year),
  }));
  const visibleMonth = month.getMonth();
  const visibleYear = month.getFullYear();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (portalRef.current?.contains(target)) return;
      setOpen(false);
      setActiveSelect(null);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setActiveSelect(null);
      return;
    }

    if (value) {
      setMonth(startOfMonth(parseISO(value)));
    }
  }, [open, value]);

  useEffect(() => {
    if (open || !value) return;
    setMonth(startOfMonth(parseISO(value)));
  }, [value, open]);

  useEffect(() => {
    if (!open || !usePortal || !triggerRef.current) {
      setPortalCoords(null);
      return;
    }

    const updatePosition = () => {
      if (!triggerRef.current) return;

      const rect = triggerRef.current.getBoundingClientRect();
      const popoverHeight = 320;
      const popoverWidth = 308;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp =
        placement === "up" ||
        (placement === "auto" &&
          spaceBelow < popoverHeight &&
          rect.top > popoverHeight);

      setPortalCoords({
        top: openUp ? rect.top - popoverHeight - 6 : rect.bottom + 6,
        left: Math.min(rect.left, window.innerWidth - popoverWidth - 12),
      });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, usePortal, placement, month]);

  const displayValue = selectedDate ? format(selectedDate, "dd MMM yyyy") : "";

  const handleMonthChange = (newMonth: Date) => {
    setMonth(newMonth);

    if (value) {
      onChange(updateDatePreserveDay(value, newMonth));
    }
  };

  const handleDayClick = (day: Date) => {
    onChange(format(day, "yyyy-MM-dd"));
    setActiveSelect(null);
    setOpen(false);
  };

  const calendarPanel = (
    <div
      className={clsx(
        "bg-white border border-slate-200 rounded-xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150",
        usePortal ? "w-[308px]" : "absolute left-0 top-full mt-1.5 z-50",
      )}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="w-[276px]">
        <div className="flex items-center justify-between gap-2 mb-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveSelect(null);
              handleMonthChange(subMonths(month, 1));
            }}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <CalendarSelect
              value={visibleMonth}
              options={MONTHS}
              onChange={(monthValue) => {
                handleMonthChange(updateCalendarMonth(month, monthValue));
                setActiveSelect(null);
              }}
              isOpen={activeSelect === "month"}
              onToggle={() =>
                setActiveSelect((current) =>
                  current === "month" ? null : "month",
                )
              }
              className="flex-1 min-w-0"
            />
            <CalendarSelect
              value={visibleYear}
              options={yearOptions}
              onChange={(yearValue) => {
                handleMonthChange(
                  updateCalendarMonth(month, undefined, yearValue),
                );
                setActiveSelect(null);
              }}
              isOpen={activeSelect === "year"}
              onToggle={() =>
                setActiveSelect((current) =>
                  current === "year" ? null : "year",
                )
              }
              className="w-[84px] shrink-0"
            />
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveSelect(null);
              handleMonthChange(addMonths(month, 1));
            }}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] font-bold text-slate-400 py-1"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, month);
            const isSelected = selectedDate
              ? isSameDay(day, selectedDate)
              : false;
            const isToday = isSameDay(day, today);

            return (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isCurrentMonth) handleDayClick(day);
                }}
                className={clsx(
                  "relative h-8 w-full transition-all",
                  isCurrentMonth
                    ? "cursor-pointer"
                    : "opacity-25 pointer-events-none",
                )}
              >
                <span
                  className={clsx(
                    "relative z-10 flex items-center justify-center w-7 h-7 rounded-full mx-auto text-xs font-medium transition-all",
                    isSelected &&
                      "bg-primary-600 text-white font-bold shadow-sm",
                    !isSelected &&
                      isToday &&
                      "ring-2 ring-primary-400 ring-offset-1 text-primary-700 font-bold",
                    !isSelected &&
                      isCurrentMonth &&
                      "hover:bg-slate-100 text-slate-700",
                  )}
                >
                  {format(day, "d")}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={clsx(
        "relative",
        !className?.match(/\bmb-/) && "mb-6",
        className,
      )}
      ref={containerRef}
    >
      {label && (
        <label className="block text-xs font-semibold text-slate-700 mb-2">
          {label}
        </label>
      )}

      <div
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "w-full flex items-center gap-2 px-3 py-2 bg-white border rounded-lg cursor-pointer transition-all select-none",
          error && !open && "border-rose-300",
          open
            ? "border-primary-500 ring-2 ring-primary-500/20"
            : !error && "border-slate-200 hover:border-slate-300",
        )}
      >
        <span
          className={clsx(
            "flex-1 min-w-0 truncate text-sm",
            displayValue ? "text-slate-900" : "text-slate-400",
          )}
        >
          {displayValue || placeholder}
        </span>
      </div>

      {error && (
        <p className="mt-1 text-[11px] text-rose-500 font-medium">{error}</p>
      )}

      {open && !usePortal && calendarPanel}

      {open &&
        usePortal &&
        portalCoords &&
        createPortal(
          <div
            ref={portalRef}
            style={{
              position: "fixed",
              top: `${portalCoords.top}px`,
              left: `${portalCoords.left}px`,
              zIndex: 99999,
            }}
          >
            {calendarPanel}
          </div>,
          document.body,
        )}
    </div>
  );
}
