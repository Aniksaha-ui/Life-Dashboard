import { useMemo } from "react";
import { Drawer } from "../../../../components/Drawer";
import type { ReferralCodeSummaryRow } from "../data/referralReportData";

interface ReferralCodeSummaryDrawerProps {
  open: boolean;
  onClose: () => void;
  rows: ReferralCodeSummaryRow[];
}

export function ReferralCodeSummaryDrawer({
  open,
  onClose,
  rows,
}: ReferralCodeSummaryDrawerProps) {
  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, row) => ({
          codes: acc.codes + row.referralCodesGenerated,
          invitations: acc.invitations + row.totalInvitations,
        }),
        { codes: 0, invitations: 0 },
      ),
    [rows],
  );

  if (!open) return null;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Referral Code Summary"
      subtitle={`${rows.length} merchant${rows.length === 1 ? "" : "s"}`}
      width="lg"
      noPadding
      contentClassName="overflow-y-auto"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
              <th className="px-6 py-3 text-left whitespace-nowrap">
                Merchants
              </th>
              <th className="px-4 py-3 text-center whitespace-nowrap">Codes</th>
              <th className="px-6 py-3 text-center whitespace-nowrap">
                Invitations
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr
                  key={row.companyName}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-3 text-left text-slate-700">
                    {row.companyName}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-700 tabular-nums">
                    {row.referralCodesGenerated}
                  </td>
                  <td className="px-6 py-3 text-center text-slate-700 tabular-nums">
                    {row.totalInvitations}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-8 text-center text-sm text-slate-500"
                >
                  No referral code summary data for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200 font-bold text-slate-900">
                <td className="px-6 py-3">Total</td>
                <td className="px-4 py-3 text-center tabular-nums">
                  {totals.codes}
                </td>
                <td className="px-6 py-3 text-center tabular-nums">
                  {totals.invitations}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </Drawer>
  );
}
