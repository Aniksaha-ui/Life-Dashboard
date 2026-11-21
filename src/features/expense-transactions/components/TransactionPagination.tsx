import { ChevronLeft, ChevronRight } from "lucide-react";

type Pagination = {
  currentPage: number;
  totalPages: number;
  total: number;
  from: number;
  to: number;
};

export function TransactionPagination({
  pagination,
  onPageChange,
}: {
  pagination: Pagination;
  onPageChange: (page: number) => void;
}) {
  const { currentPage, totalPages, total, from, to } = pagination;
  if (total === 0) return null;

  return (
    <nav
      aria-label="Transaction pages"
      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-700 disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <p className="text-center text-xs text-slate-500">
        <span className="font-semibold text-slate-800">
          {from}–{to}
        </span>{" "}
        of {total}
        <span className="block text-[11px] text-slate-400">
          Page {currentPage} of {totalPages}
        </span>
      </p>
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-700 disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
