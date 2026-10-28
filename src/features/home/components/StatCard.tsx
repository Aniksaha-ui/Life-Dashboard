import { clsx } from "clsx";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { Skeleton } from "../../../components/Skeleton";

interface StatCardProps {
  title: string;
  value: string | number;
  subtext: string;
  chartData?: any[];
  color?: string;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "simple";
  isSelected?: boolean;
  isLoading?: boolean;
}

export function StatCard({
  title,
  value,
  subtext,
  chartData,
  color = "#295cab",
  onClick,
  className,
  variant = "default",
  isSelected,
  isLoading,
}: StatCardProps) {
  if (variant === "simple") {
    return (
      <div
        onClick={onClick}
        className={clsx(
          "p-3 rounded border transition-all cursor-pointer select-none",
          isSelected
            ? "bg-white border-primary-600 shadow-sm ring-1 ring-primary-50 transition-all transform scale-[1.02]"
            : "bg-slate-50 border-slate-100 hover:border-slate-300",
          className,
        )}
      >
        <p className="text-[10px] text-slate-500 uppercase tracking-wide">
          {title.includes("(") ? (
            <>
              {title.split(" (")[0]}{" "}
              <span className="text-[10px] lowercase font-normal opacity-80">
                ({title.split(" (")[1]}
              </span>
            </>
          ) : (
            title
          )}
        </p>
        {isLoading ? (
          <div className="mt-1 space-y-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        ) : (
          <>
            <p className="text-lg font-bold text-slate-900 mt-1">{value}</p>
            <p
              className={clsx(
                "text-[10px] mt-0.5 font-medium",
                typeof subtext === "string" && subtext.includes("+")
                  ? "text-emerald-600"
                  : typeof subtext === "string" && subtext.includes("-")
                    ? "text-rose-600"
                    : "text-slate-400",
              )}
            >
              {subtext}
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={clsx(
        "bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col hover:shadow-md transition-shadow cursor-pointer select-none",
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
        {title.includes("(") ? (
          <>
            {title.split(" (")[0]}{" "}
            <span className="text-[10px] lowercase font-normal opacity-80">
              ({title.split(" (")[1]}
            </span>
          </>
        ) : (
          title
        )}
      </p>
      <div className="flex items-end justify-between">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        ) : (
          <div>
            <h4 className="text-2xl font-bold text-slate-900">{value}</h4>
            <p className="text-xs text-slate-500 mt-1">{subtext}</p>
          </div>
        )}
        {isLoading ? (
          <Skeleton className="h-10 w-24" />
        ) : (
          <div className="h-10 w-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
