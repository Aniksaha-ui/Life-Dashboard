import { CreditCard, Pencil } from "lucide-react";
import { useMemo, useState } from "react";
import { DataTable } from "../../../components/DataTable";
import { EmptyState } from "../../../components/EmptyState";
import { MobileRecordDrawer } from "../../../components/MobileRecordDrawer";
import type { AccountRow } from "../types";
import { getAccountColumns } from "./columns";

export function AccountTable({
  rows,
  isLoading,
  onEdit,
}: {
  rows: AccountRow[];
  isLoading: boolean;
  onEdit: (row: AccountRow) => void;
}) {
  const [selectedAccount, setSelectedAccount] = useState<AccountRow | null>(
    null,
  );
  const columns = useMemo(() => getAccountColumns(onEdit), [onEdit]);

  if (!rows.length && !isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white">
        <EmptyState
          title="No accounts found"
          subtitle="Try another filter or create an account."
        />
      </div>
    );
  }

  return (
    <>
      <DataTable
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingText="Loading accounts..."
        hideToolbarDateFilter
        hideViewColumn
        mobileCard
        mobileCardTitleColumn={2}
        mobileCardHideFirstColumn
        className="compact-mobile-table border-slate-200"
        onRowClick={setSelectedAccount}
      />
      <MobileRecordDrawer
        open={Boolean(selectedAccount)}
        onClose={() => setSelectedAccount(null)}
        title={selectedAccount?.name || "Account Details"}
        badge={selectedAccount?.typeLabel}
        badgeClassName="bg-blue-50 text-blue-700 ring-blue-200"
        recordId={selectedAccount ? `ACC #${selectedAccount.id}` : undefined}
        headerAction={
          selectedAccount ? (
            <button
              type="button"
              onClick={() => {
                const target = selectedAccount;
                setSelectedAccount(null);
                onEdit(target);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
          ) : undefined
        }
        hero={
          selectedAccount
            ? {
                icon: CreditCard,
                iconClassName: "bg-blue-50 text-blue-600",
                overline: "Current balance",
                value: selectedAccount.currentBalanceLabel,
                valueClassName: "tabular-nums text-primary-700",
                meta: `${selectedAccount.institutionLabel} · ${selectedAccount.typeLabel}`,
                stats: [
                  {
                    label: "Status",
                    value: selectedAccount.isActive ? "Active" : "Inactive",
                    valueClassName: selectedAccount.isActive
                      ? "text-emerald-700"
                      : "text-slate-500",
                  },
                  {
                    label: "Institution",
                    value: selectedAccount.institutionLabel,
                  },
                ],
              }
            : undefined
        }
        details={
          selectedAccount
            ? [
                { label: "Account ID", value: `ACC #${selectedAccount.id}` },
                { label: "Account Name", value: selectedAccount.name },
                {
                  label: "Institution",
                  value: selectedAccount.institutionLabel,
                },
                { label: "Type", value: selectedAccount.typeLabel },
                {
                  label: "Current Balance",
                  value: selectedAccount.currentBalanceLabel,
                },
                {
                  label: "Status",
                  value: selectedAccount.isActive ? "Active" : "Inactive",
                },
              ]
            : []
        }
        sections={
          selectedAccount
            ? [
                {
                  title: "Record Information",
                  items: [
                    {
                      label: "Last updated",
                      value: selectedAccount.updatedAtLabel,
                      fullWidth: true,
                    },
                  ],
                },
              ]
            : []
        }
      />
    </>
  );
}
