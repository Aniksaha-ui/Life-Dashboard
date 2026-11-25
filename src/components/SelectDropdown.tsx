import clsx from "clsx";
import { Check, ChevronDown, Search, X, type LucideIcon } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";

export interface SelectDropdownOption {
  value: string;
  label: string;
  description?: string;
  badge?: string;
  group?: string;
  icon?: LucideIcon;
}

interface SelectDropdownProps {
  label: string;
  value: string;
  options: SelectDropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
}

interface PanelPosition {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  openUpward: boolean;
}

export function SelectDropdown({
  label,
  value,
  options,
  onChange,
  placeholder = "Select an option",
  searchable = false,
  searchPlaceholder = "Search...",
  emptyMessage = "No matching options",
  disabled = false,
  className = "",
}: SelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [position, setPosition] = useState<PanelPosition | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return options;

    return options.filter((option) =>
      `${option.label} ${option.description ?? ""} ${option.group ?? ""} ${option.badge ?? ""}`
        .toLowerCase()
        .includes(term),
    );
  }, [options, query]);

  const groupedOptions = useMemo(() => {
    const groups: Array<{
      name: string | null;
      items: Array<{ option: SelectDropdownOption; flatIndex: number }>;
    }> = [];
    const byName = new Map<string | null, number>();

    filteredOptions.forEach((option, flatIndex) => {
      const groupName = option.group ?? null;
      const existingIdx = byName.get(groupName);
      if (existingIdx !== undefined) {
        groups[existingIdx].items.push({ option, flatIndex });
      } else {
        byName.set(groupName, groups.length);
        groups.push({ name: groupName, items: [{ option, flatIndex }] });
      }
    });

    return groups;
  }, [filteredOptions]);

  const updatePosition = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const margin = 12;
    const gap = 6;
    const spaceBelow = viewportHeight - rect.bottom - margin - gap;
    const spaceAbove = rect.top - margin - gap;
    const openUpward = spaceBelow < 220 && spaceAbove > spaceBelow;
    const availableSpace = openUpward ? spaceAbove : spaceBelow;
    const maxHeight = Math.max(160, Math.min(320, availableSpace));
    const width = Math.min(
      Math.max(rect.width, 220),
      viewportWidth - margin * 2,
    );
    const left = Math.max(
      margin,
      Math.min(rect.left, viewportWidth - width - margin),
    );

    setPosition({
      top: openUpward ? rect.top - gap : rect.bottom + gap,
      left,
      width,
      maxHeight,
      openUpward,
    });
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
  }, []);

  const selectOption = useCallback(
    (nextValue: string) => {
      onChange(nextValue);
      close();
      triggerRef.current?.focus();
    },
    [onChange, close],
  );

  useEffect(() => {
    if (!isOpen) return;

    updatePosition();
    if (searchable) {
      requestAnimationFrame(() => searchInputRef.current?.focus());
    }

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        close();
      }
    };

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopImmediatePropagation();
        close();
        triggerRef.current?.focus();
      }
    };

    const handleReposition = () => updatePosition();

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape, true);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape, true);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [isOpen, searchable, updatePosition, close]);

  useEffect(() => {
    if (!isOpen) return;
    const activeIdx = filteredOptions.findIndex((opt) => opt.value === value);
    setHighlightedIndex(activeIdx >= 0 ? activeIdx : 0);
  }, [isOpen, query, value, filteredOptions]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (
        event.key === "ArrowDown" ||
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((prev) =>
        filteredOptions.length ? (prev + 1) % filteredOptions.length : 0,
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((prev) =>
        filteredOptions.length
          ? (prev - 1 + filteredOptions.length) % filteredOptions.length
          : 0,
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      const target = filteredOptions[highlightedIndex];
      if (target) selectOption(target.value);
    }
  };

  const SelectedIcon = selectedOption?.icon;

  return (
    <div className={clsx("select-dropdown relative min-w-0", className)}>
      <span
        className={clsx(
          "pointer-events-none absolute top-0 left-2 z-[1] max-w-[calc(100%-1rem)] -translate-y-1/2 truncate bg-white px-1 text-xs leading-none font-medium transition-colors",
          isOpen ? "text-primary-600" : "text-slate-600",
        )}
      >
        {label}
      </span>

      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={clsx(
          "flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-md border bg-white px-3 text-left text-sm transition focus:outline-none",
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
            : isOpen
              ? "border-primary-600 shadow-[0_0_0_3px_rgb(41_92_171_/_0.12)]"
              : "border-slate-300 text-slate-800 hover:border-slate-400 focus:border-primary-600 focus:shadow-[0_0_0_3px_rgb(41_92_171_/_0.12)]",
        )}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          {SelectedIcon && (
            <SelectedIcon className="h-4 w-4 shrink-0 text-primary-600" />
          )}
          <span
            className={clsx(
              "truncate",
              selectedOption ? "font-medium text-slate-800" : "text-slate-400",
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.description && (
            <span className="hidden truncate text-xs text-slate-400 sm:inline">
              {selectedOption.description}
            </span>
          )}
        </span>
        <ChevronDown
          className={clsx(
            "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-150",
            isOpen && "rotate-180 text-primary-600",
          )}
        />
      </button>

      {isOpen &&
        position &&
        createPortal(
          <div
            ref={panelRef}
            role="listbox"
            onKeyDown={handleKeyDown}
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              width: position.width,
              transform: position.openUpward ? "translateY(-100%)" : undefined,
            }}
            className="z-[300] flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/12"
          >
            {searchable && (
              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-3 py-2">
                <Search className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full min-w-0 border-0 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="rounded p-0.5 text-slate-400 hover:bg-slate-200/70 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}

            <div
              style={{ maxHeight: position.maxHeight }}
              className="overflow-y-auto p-1.5"
            >
              {filteredOptions.length === 0 ? (
                <p className="px-3 py-5 text-center text-xs text-slate-500">
                  {emptyMessage}
                </p>
              ) : (
                groupedOptions.map((group, groupIndex) => (
                  <div
                    key={group.name ?? `group-${groupIndex}`}
                    className={clsx(groupIndex > 0 && "mt-1.5")}
                  >
                    {group.name && (
                      <div className="px-2.5 pt-1.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        {group.name}
                      </div>
                    )}
                    <div className="space-y-0.5">
                      {group.items.map(({ option, flatIndex }) => {
                        const isSelected = option.value === value;
                        const isHighlighted = flatIndex === highlightedIndex;
                        const OptionIcon = option.icon;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onMouseEnter={() => setHighlightedIndex(flatIndex)}
                            onClick={() => selectOption(option.value)}
                            className={clsx(
                              "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                              isSelected
                                ? "bg-primary-50 font-semibold text-primary-700"
                                : isHighlighted
                                  ? "bg-slate-100 text-slate-900"
                                  : "text-slate-700 hover:bg-slate-50",
                            )}
                          >
                            <span className="flex min-w-0 flex-1 items-center gap-2.5">
                              {OptionIcon && (
                                <OptionIcon
                                  className={clsx(
                                    "h-4 w-4 shrink-0",
                                    isSelected
                                      ? "text-primary-600"
                                      : "text-slate-400",
                                  )}
                                />
                              )}
                              <span className="min-w-0 flex-1">
                                <span className="block truncate">
                                  {option.label}
                                </span>
                                {option.description && (
                                  <span className="block truncate text-xs font-normal text-slate-400">
                                    {option.description}
                                  </span>
                                )}
                              </span>
                            </span>

                            <span className="flex shrink-0 items-center gap-1.5">
                              {option.badge && (
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                  {option.badge}
                                </span>
                              )}
                              {isSelected && (
                                <Check className="h-4 w-4 text-primary-600" />
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
