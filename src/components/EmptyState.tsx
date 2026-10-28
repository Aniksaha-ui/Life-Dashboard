import { Search, type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
}

export function EmptyState({
  title = "No Data Found",
  subtitle = "Try adjusting your filters",
  icon: Icon = Search,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-slate-300" strokeWidth={1.5} />
      </div>
      <h3 className="text-sm font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}
