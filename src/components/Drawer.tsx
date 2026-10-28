import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  width?: "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";
  headerAction?: React.ReactNode;
  noPadding?: boolean;
  contentClassName?: string;
}

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = "lg",
  headerAction,
  noPadding = false,
  contentClassName,
}: DrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [open, onClose]);

  if (!open) return null;

  const widthClasses = {
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    full: "max-w-[90vw]",
  };

  return createPortal(
    <div className="fixed inset-0 z-[150] flex justify-end transform transition-all duration-300 ease-in-out">
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={clsx(
          "relative h-full w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300",
          widthClasses[width],
        )}
      >
        {/* Header */}
        <div className="drawer-header px-6 py-4 border-b border-slate-100 flex items-start justify-between bg-white z-10">
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            )}
            {subtitle && (
              <div className="text-sm text-slate-500 mt-1">{subtitle}</div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {headerAction}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className={clsx(
            "flex-1 min-h-0",
            contentClassName ?? "overflow-y-auto",
            !noPadding && "p-6",
          )}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
