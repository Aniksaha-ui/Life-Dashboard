import { useMemo } from "react";
import { Drawer } from "../../../../components/Drawer";
import type { CountryUserRow } from "../data/instantSignupAnalyticsData";

interface CountryWiseUsersDrawerProps {
  open: boolean;
  onClose: () => void;
  rows: CountryUserRow[];
}

export function CountryWiseUsersDrawer({
  open,
  onClose,
  rows,
}: CountryWiseUsersDrawerProps) {
  const totalCount = useMemo(
    () => rows.reduce((sum, row) => sum + row.count, 0),
    [rows],
  );

  if (!open) return null;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Country-wise Users Count"
      subtitle={`${rows.length} countr${rows.length === 1 ? "y" : "ies"}`}
      width="lg"
      noPadding
      contentClassName="overflow-y-auto"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
              <th className="px-6 py-3 text-left whitespace-nowrap">Country</th>
              <th className="px-6 py-3 text-right whitespace-nowrap w-28">
                Count
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr
                  key={row.country}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-3 text-left text-slate-700 break-words">
                    {row.country}
                  </td>
                  <td className="px-6 py-3 text-right text-slate-900 font-semibold tabular-nums">
                    {row.count}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={2}
                  className="px-6 py-8 text-center text-sm text-slate-500"
                >
                  No country data for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200 font-bold text-slate-900">
                <td className="px-6 py-3">Total</td>
                <td className="px-6 py-3 text-right tabular-nums">
                  {totalCount}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </Drawer>
  );
}
