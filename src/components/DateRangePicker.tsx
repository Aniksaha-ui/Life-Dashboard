import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { clsx } from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  format,
  startOfMonth,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  isAfter,
  isBefore,
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

export interface DateRange {
  startDate: string; // ISO yyyy-MM-dd
  endDate: string; // ISO yyyy-MM-dd
}

interface DateRangePickerProps {
  label?: string;
  value: DateRange;
  onChange: (range: DateRange) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  error?: string;
  usePortal?: boolean;
  placement?: "up" | "down" | "auto";
}

type ActiveSelect =
  "left-month" | "left-year" | "right-month" | "right-year" | null;

interface CalendarPanelProps {
  month: Date;
  panelKey: "left" | "right";
  onMonthChange: (month: Date) => void;
  onPrev: () => void;
  onNext: () => void;
  activeSelect: ActiveSelect;
  setActiveSelect: (value: ActiveSelect) => void;
  startDate: Date | null;
  endDate: Date | null;
  hoveredDate: Date | null;
  selecting: "start" | "end";
  minDateStr?: string;
  maxDateStr?: string;
  onDayClick: (day: Date) => void;
  onDayHover: (day: Date | null) => void;
}

function CalendarPanel({
  month,
  panelKey,
  onMonthChange,
  onPrev,
  onNext,
  activeSelect,
  setActiveSelect,
  startDate,
  endDate,
  hoveredDate,
  selecting,
  minDateStr,
  maxDateStr,
  onDayClick,
  onDayHover,
}: CalendarPanelProps) {
  const days = buildCalendarDays(month);
  const today = new Date();
  const yearOptions = buildYearOptions().map((year) => ({
    value: year,
    label: String(year),
  }));
  const visibleMonth = month.getMonth();
  const visibleYear = month.getFullYear();
  const monthSelectKey = `${panelKey}-month` as ActiveSelect;
  const yearSelectKey = `${panelKey}-year` as ActiveSelect;

  const getDayState = (day: Date) => {
    const isStart = startDate ? isSameDay(day, startDate) : false;
    const isEnd = endDate ? isSameDay(day, endDate) : false;
    const isCurrentMonth = isSameMonth(day, month);
    const isToday = isSameDay(day, today);

    let isInRange = false;
    let isHoverRange = false;

    if (startDate && endDate) {
      const s = isAfter(startDate, endDate) ? endDate : startDate;
      const e = isAfter(startDate, endDate) ? startDate : endDate;
      isInRange = isWithinInterval(day, { start: s, end: e });
    } else if (startDate && hoveredDate && selecting === "end") {
      if (!isBefore(hoveredDate, startDate)) {
        isHoverRange = isWithinInterval(day, {
          start: startDate,
          end: hoveredDate,
        });
      }
    }

    return { isStart, isEnd, isInRange, isHoverRange, isCurrentMonth, isToday };
  };

  return (
    <div className="w-[276px]">
      <div className="flex items-center justify-between gap-2 mb-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setActiveSelect(null);
            onPrev();
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
              onMonthChange(updateCalendarMonth(month, monthValue));
              setActiveSelect(null);
            }}
            isOpen={activeSelect === monthSelectKey}
            onToggle={() =>
              setActiveSelect(
                activeSelect === monthSelectKey ? null : monthSelectKey,
              )
            }
            className="flex-1 min-w-0"
          />
          <CalendarSelect
            value={visibleYear}
            options={yearOptions}
            onChange={(yearValue) => {
              onMonthChange(updateCalendarMonth(month, undefined, yearValue));
              setActiveSelect(null);
            }}
            isOpen={activeSelect === yearSelectKey}
            onToggle={() =>
              setActiveSelect(
                activeSelect === yearSelectKey ? null : yearSelectKey,
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
            onNext();
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
          const {
            isStart,
            isEnd,
            isInRange,
            isHoverRange,
            isCurrentMonth,
            isToday,
          } = getDayState(day);
          const isSelected = isStart || isEnd;
          const hasRangeRight = isStart && (endDate || hoveredDate);
          const hasRangeLeft = isEnd && startDate;
          const dayStr = format(day, "yyyy-MM-dd");
          const isOutOfBounds =
            (minDateStr && dayStr < minDateStr) ||
            (maxDateStr && dayStr > maxDateStr);
          const isDisabled = !isCurrentMonth;

          return (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!isCurrentMonth) return;
                onDayClick(day);
              }}
              onMouseEnter={() => {
                if (isCurrentMonth && !isOutOfBounds) onDayHover(day);
              }}
              onMouseLeave={() => onDayHover(null)}
              className={clsx(
                "relative h-8 w-full transition-all cursor-pointer",
                !isCurrentMonth && "opacity-25 pointer-events-none",
                isOutOfBounds && isCurrentMonth && "opacity-40",
                (isInRange || isHoverRange) && !isSelected && "bg-primary-50",
              )}
            >
              {hasRangeRight && (
                <span className="absolute inset-y-0 left-1/2 right-0 bg-primary-50 z-0 pointer-events-none" />
              )}
              {hasRangeLeft && (
                <span className="absolute inset-y-0 left-0 right-1/2 bg-primary-50 z-0 pointer-events-none" />
              )}

              <span
                className={clsx(
                  "relative z-10 flex items-center justify-center w-7 h-7 rounded-full mx-auto text-xs font-medium transition-all pointer-events-none",
                  isSelected && "bg-primary-600 text-white font-bold shadow-sm",
                  !isSelected &&
                    isToday &&
                    "ring-2 ring-primary-400 ring-offset-1 text-primary-700 font-bold",
                  !isSelected &&
                    !isInRange &&
                    !isHoverRange &&
                    !isOutOfBounds &&
                    "hover:bg-slate-100 text-slate-700",
                  !isSelected &&
                    (isInRange || isHoverRange) &&
                    "text-primary-700 hover:bg-primary-100",
                  isOutOfBounds && isCurrentMonth && "text-slate-400",
                )}
              >
                {format(day, "d")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DateRangePicker({
  label,
  value,
  onChange,
  placeholder = "Select date range",
  className,
  error,
  usePortal = false,
  placement = "auto",
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [selecting, setSelecting] = useState<"start" | "end">("start");
  const [activeSelect, setActiveSelect] = useState<ActiveSelect>(null);
  const [portalCoords, setPortalCoords] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const [leftMonth, setLeftMonth] = useState<Date>(() => {
    if (value.startDate) return startOfMonth(parseISO(value.startDate));
    return startOfMonth(new Date());
  });
  const [rightMonth, setRightMonth] = useState<Date>(() => {
    if (value.endDate) return startOfMonth(parseISO(value.endDate));
    const initialLeft = value.startDate
      ? startOfMonth(parseISO(value.startDate))
      : startOfMonth(new Date());
    return addMonths(initialLeft, 1);
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (portalRef.current?.contains(target)) return;
      setOpen(false);
      setSelecting("start");
      setHoveredDate(null);
      setActiveSelect(null);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open || !usePortal || !triggerRef.current) {
      setPortalCoords(null);
      return;
    }

    const updatePosition = () => {
      if (!triggerRef.current) return;

      const rect = triggerRef.current.getBoundingClientRect();
      const popoverWidth = 620;
      const popoverHeight = 420;
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
  }, [open, usePortal, placement, leftMonth, rightMonth, selecting]);

  useEffect(() => {
    if (!open) {
      setActiveSelect(null);
      return;
    }

    if (value.startDate) {
      setLeftMonth(startOfMonth(parseISO(value.startDate)));
    }
    if (value.endDate) {
      setRightMonth(startOfMonth(parseISO(value.endDate)));
    } else if (value.startDate) {
      setRightMonth(addMonths(startOfMonth(parseISO(value.startDate)), 1));
    }

    if (value.startDate && value.endDate) {
      setSelecting("end");
    } else if (value.startDate) {
      setSelecting("end");
    } else {
      setSelecting("start");
    }
  }, [open]);

  const startDate = value.startDate ? parseISO(value.startDate) : null;
  const endDate = value.endDate ? parseISO(value.endDate) : null;

  const displayValue = (() => {
    if (startDate && endDate) {
      return `${format(startDate, "dd MMM yyyy")} - ${format(endDate, "dd MMM yyyy")}`;
    }
    if (startDate) {
      return `${format(startDate, "dd MMM yyyy")} - ...`;
    }
    return "";
  })();

  const handleDayClick = (day: Date) => {
    setActiveSelect(null);
    const dayStr = format(day, "yyyy-MM-dd");

    if (selecting === "start") {
      if (value.endDate && dayStr > value.endDate) {
        toast.error(
          `Start date cannot be after ${format(parseISO(value.endDate), "dd MMM yyyy")}.`,
          { id: "date-range-invalid" },
        );
        return;
      }

      onChange({
        startDate: dayStr,
        endDate: value.endDate,
      });
      setSelecting("end");
      return;
    }

    if (!value.startDate) {
      onChange({ startDate: dayStr, endDate: value.endDate });
      setSelecting("end");
      return;
    }

    if (dayStr < value.startDate) {
      toast.error(
        `End date cannot be before ${format(parseISO(value.startDate), "dd MMM yyyy")}.`,
        { id: "date-range-invalid" },
      );
      return;
    }

    onChange({
      startDate: value.startDate,
      endDate: dayStr,
    });

    setSelecting("start");
    setOpen(false);
    setHoveredDate(null);
  };

  const handleSelectStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSelect(null);
    setSelecting("start");
    if (value.startDate) {
      setLeftMonth(startOfMonth(parseISO(value.startDate)));
    }
  };

  const handleSelectEnd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSelect(null);
    setSelecting("end");
    if (value.endDate) {
      setRightMonth(startOfMonth(parseISO(value.endDate)));
    }
  };

  const handleLeftMonthChange = (newMonth: Date) => {
    setLeftMonth(newMonth);

    if (value.startDate) {
      const nextStartDate = updateDatePreserveDay(value.startDate, newMonth);
      let nextEndDate = value.endDate;

      if (
        nextEndDate &&
        isAfter(parseISO(nextStartDate), parseISO(nextEndDate))
      ) {
        nextEndDate = nextStartDate;
      }

      onChange({
        startDate: nextStartDate,
        endDate: nextEndDate,
      });
    }
  };

  const handleRightMonthChange = (newMonth: Date) => {
    setRightMonth(newMonth);

    if (value.endDate) {
      let nextEndDate = updateDatePreserveDay(value.endDate, newMonth);

      if (
        value.startDate &&
        isBefore(parseISO(nextEndDate), parseISO(value.startDate))
      ) {
        nextEndDate = value.startDate;
      }

      onChange({
        startDate: value.startDate,
        endDate: nextEndDate,
      });
    }
  };

  const endMinDateStr =
    selecting === "end" && value.startDate ? value.startDate : undefined;
  const startMaxDateStr =
    selecting === "start" && value.endDate ? value.endDate : undefined;

  const calendarPanel = (
    <div
      className={clsx(
        "bg-white border border-slate-200 rounded-xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150",
        usePortal ? "w-[620px]" : "absolute left-0 top-full mt-1.5 z-50",
      )}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
        <button
          type="button"
          onClick={handleSelectStart}
          className={clsx(
            "flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-center border transition-all cursor-pointer",
            selecting === "start"
              ? "border-primary-400 bg-primary-50 text-primary-700 ring-2 ring-primary-400/20"
              : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300",
          )}
        >
          <span className="block text-[10px] font-bold uppercase tracking-wider mb-0.5 opacity-70">
            Start Date
          </span>
          {value.startDate
            ? format(parseISO(value.startDate), "dd MMM yyyy")
            : "Select…"}
        </button>
        <span className="text-slate-300 font-bold">-</span>
        <button
          type="button"
          onClick={handleSelectEnd}
          className={clsx(
            "flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-center border transition-all cursor-pointer",
            selecting === "end"
              ? "border-primary-400 bg-primary-50 text-primary-700 ring-2 ring-primary-400/20"
              : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300",
          )}
        >
          <span className="block text-[10px] font-bold uppercase tracking-wider mb-0.5 opacity-70">
            End Date
          </span>
          {value.endDate
            ? format(parseISO(value.endDate), "dd MMM yyyy")
            : "Select…"}
        </button>
      </div>

      <div className="flex gap-6">
        <CalendarPanel
          month={leftMonth}
          panelKey="left"
          onMonthChange={handleLeftMonthChange}
          onPrev={() => handleLeftMonthChange(subMonths(leftMonth, 1))}
          onNext={() => handleLeftMonthChange(addMonths(leftMonth, 1))}
          activeSelect={activeSelect}
          setActiveSelect={setActiveSelect}
          startDate={startDate}
          endDate={endDate}
          hoveredDate={hoveredDate}
          selecting={selecting}
          minDateStr={endMinDateStr}
          maxDateStr={startMaxDateStr}
          onDayClick={handleDayClick}
          onDayHover={setHoveredDate}
        />
        <div className="w-px bg-slate-100 self-stretch" />
        <CalendarPanel
          month={rightMonth}
          panelKey="right"
          onMonthChange={handleRightMonthChange}
          onPrev={() => handleRightMonthChange(subMonths(rightMonth, 1))}
          onNext={() => handleRightMonthChange(addMonths(rightMonth, 1))}
          activeSelect={activeSelect}
          setActiveSelect={setActiveSelect}
          startDate={startDate}
          endDate={endDate}
          hoveredDate={hoveredDate}
          selecting={selecting}
          minDateStr={endMinDateStr}
          maxDateStr={startMaxDateStr}
          onDayClick={handleDayClick}
          onDayHover={setHoveredDate}
        />
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
            data-date-range-picker-portal
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
