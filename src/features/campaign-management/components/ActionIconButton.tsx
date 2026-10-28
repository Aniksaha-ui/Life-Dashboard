import type { LucideIcon } from "lucide-react";
import { clsx } from "clsx";
import { Tooltip as UITooltip } from "../../../components/Tooltip";

const actionButtonClass =
  "flex flex-col items-center gap-0 group cursor-pointer";
const iconWrapClass =
  "pt-1.5 px-1.5 pb-0 hover:bg-slate-100 rounded text-slate-400 group-hover:text-primary-600 transition-colors";
const labelClass =
  "text-[9px] font-medium text-slate-500 group-hover:text-primary-600 transition-colors";

export function ActionIconButton({
  label,
  tooltip,
  icon: Icon,
  onClick,
}: {
  label: string;
  tooltip?: string;
  icon: LucideIcon;
  onClick: () => void;
}) {
  const button = (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={actionButtonClass}
    >
      <div className={iconWrapClass}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <span className={labelClass}>{label}</span>
    </button>
  );

  if (!tooltip) return button;

  return <UITooltip content={tooltip}>{button}</UITooltip>;
}

export function ActionIconButtonGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx("flex items-center gap-3 whitespace-nowrap", className)}
    >
      {children}
    </div>
  );
}
