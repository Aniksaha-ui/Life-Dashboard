import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { clsx } from "clsx";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?:
    "top" | "bottom" | "left" | "right" | "bottom-left" | "bottom-right";
  className?: string;
}

type TooltipCoords = {
  top: number;
  left: number;
  transform: string;
};

function getCoords(
  rect: DOMRect,
  position: NonNullable<TooltipProps["position"]>,
): TooltipCoords {
  const gap = 8;

  switch (position) {
    case "bottom":
      return {
        top: rect.bottom + gap,
        left: rect.left + rect.width / 2,
        transform: "translateX(-50%)",
      };
    case "bottom-left":
      return {
        top: rect.bottom + gap,
        left: rect.right,
        transform: "translateX(-100%)",
      };
    case "bottom-right":
      return {
        top: rect.bottom + gap,
        left: rect.left,
        transform: "translateX(0)",
      };
    case "left":
      return {
        top: rect.top + rect.height / 2,
        left: rect.left - gap,
        transform: "translate(-100%, -50%)",
      };
    case "right":
      return {
        top: rect.top + rect.height / 2,
        left: rect.right + gap,
        transform: "translateY(-50%)",
      };
    case "top":
    default:
      return {
        top: rect.top - gap,
        left: rect.left + rect.width / 2,
        transform: "translate(-50%, -100%)",
      };
  }
}

export function Tooltip({
  content,
  children,
  position = "top",
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<TooltipCoords | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    const el = triggerRef.current;
    if (!el) return;
    setCoords(getCoords(el.getBoundingClientRect(), position));
  };

  useLayoutEffect(() => {
    if (!isVisible) return;
    updatePosition();
  }, [isVisible, position, content]);

  useEffect(() => {
    if (!isVisible) return;

    const handleReposition = () => updatePosition();
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);

    return () => {
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [isVisible, position]);

  return (
    <div
      ref={triggerRef}
      className={clsx("relative flex items-center", className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible &&
        coords &&
        createPortal(
          <div
            className="fixed z-[200] px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg shadow-xl pointer-events-none animate-in fade-in zoom-in duration-200 w-max min-w-[80px] max-w-[250px] text-center"
            style={{
              top: coords.top,
              left: coords.left,
              transform: coords.transform,
            }}
          >
            {content}
            <div
              className={clsx(
                "absolute w-1.5 h-1.5 bg-white rotate-45 z-[-1]",
                position === "top" &&
                  "bottom-[-3px] left-1/2 -translate-x-1/2 border-r border-b border-slate-200",
                position === "bottom" &&
                  "top-[-3px] left-1/2 -translate-x-1/2 border-l border-t border-slate-200",
                position === "bottom-left" &&
                  "top-[-3px] right-3 border-l border-t border-slate-200",
                position === "bottom-right" &&
                  "top-[-3px] left-3 border-l border-t border-slate-200",
                position === "left" &&
                  "right-[-3px] top-1/2 -translate-y-1/2 border-t border-r border-slate-200",
                position === "right" &&
                  "left-[-3px] top-1/2 -translate-y-1/2 border-b border-l border-slate-200",
              )}
            />
          </div>,
          document.body,
        )}
    </div>
  );
}
