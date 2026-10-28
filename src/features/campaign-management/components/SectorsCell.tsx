import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import { clsx } from "clsx";

interface SectorsCellProps {
  sectorsStr?: string;
}

const POPUP_WIDTH = 420;
const POPUP_GAP = 6;

export function SectorsCell({ sectorsStr }: SectorsCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPositioned, setIsPositioned] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const computePopupPosition = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return null;

    const rect = button.getBoundingClientRect();
    const popupHeight = popupRef.current?.offsetHeight ?? 280;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openAbove =
      spaceBelow < popupHeight + POPUP_GAP && spaceAbove > spaceBelow;

    let left = rect.left;
    if (left + POPUP_WIDTH > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - POPUP_WIDTH - 12);
    }

    const top = openAbove
      ? rect.top - popupHeight - POPUP_GAP
      : rect.bottom + POPUP_GAP;

    return { top, left };
  }, []);

  const closePopup = () => {
    setIsOpen(false);
    setIsPositioned(false);
  };

  const openPopup = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsPositioned(false);
    setIsOpen(true);
  };

  const scheduleClose = () => {
    closeTimeoutRef.current = setTimeout(() => {
      closePopup();
    }, 200);
  };

  useLayoutEffect(() => {
    if (!isOpen) return;

    const position = computePopupPosition();
    if (position) {
      setPopupPosition(position);
      setIsPositioned(true);
    }
  }, [isOpen, computePopupPosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handleReposition = () => {
      const position = computePopupPosition();
      if (position) {
        setPopupPosition(position);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current?.contains(target) ||
        popupRef.current?.contains(target)
      ) {
        return;
      }
      closePopup();
    };

    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, computePopupPosition]);

  if (!sectorsStr || sectorsStr === "N/A") {
    return <span className="text-xs text-slate-400 font-medium">N/A</span>;
  }

  const sectorList = sectorsStr
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (sectorList.length <= 2) {
    return (
      <span className="text-xs font-medium text-slate-700">{sectorsStr}</span>
    );
  }

  const firstTwo = sectorList.slice(0, 2).join(", ");
  const remainingCount = sectorList.length - 2;

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center gap-1.5 group"
    >
      <span className="text-xs font-medium text-slate-700" title={firstTwo}>
        {firstTwo}
      </span>
      <div
        className="relative inline-block"
        onMouseEnter={openPopup}
        onMouseLeave={scheduleClose}
      >
        <button
          ref={buttonRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
            if (isOpen) {
              closePopup();
            } else {
              openPopup();
            }
          }}
          className={clsx(
            "inline-flex items-center justify-center min-w-6 h-5 px-1.5 rounded border text-[10px] font-bold transition-all select-none shadow-2xs cursor-pointer",
            isOpen
              ? "bg-primary-600 text-white border-primary-600 shadow-sm"
              : "bg-slate-100/90 hover:bg-primary-50 text-slate-600 hover:text-primary-600 border-slate-200/80 hover:border-primary-200",
          )}
          title={`View all ${sectorList.length} sectors`}
        >
          +{remainingCount}
        </button>
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={popupRef}
            style={{
              position: "fixed",
              top: popupPosition.top,
              left: popupPosition.left,
              width: POPUP_WIDTH,
              zIndex: 9999,
            }}
            className={clsx(
              "transition-opacity duration-150 ease-out",
              isPositioned ? "opacity-100" : "opacity-0 pointer-events-none",
            )}
            onMouseEnter={openPopup}
            onMouseLeave={scheduleClose}
          >
            <div className="p-3.5 bg-white rounded-xl shadow-xl border border-slate-200 text-left">
              <div className="pb-1.5 mb-2.5 border-b border-slate-100">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  All Sectors ({sectorList.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
                {sectorList.map((sec, idx) => (
                  <span
                    key={idx}
                    className={clsx(
                      "px-2 py-0.5 text-[11px] font-medium rounded-md border",
                      idx < 2
                        ? "bg-primary-50/70 text-primary-800 border-primary-200/80 font-bold"
                        : "bg-slate-50 text-slate-700 border-slate-200/80 font-semibold",
                    )}
                  >
                    {sec}
                  </span>
                ))}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
