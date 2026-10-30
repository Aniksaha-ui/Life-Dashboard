import { useMemo, useState } from "react";
import { DataTable } from "../../../components/DataTable";
import { EmptyState } from "../../../components/EmptyState";
import type { AccountRow } from "../types";
import { getAccountColumns } from "./columns";
import { MobileRecordDrawer } from "../../../components/MobileRecordDrawer";

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
  if (!rows.length && !isLoading)
    return (
      <div className="rounded-xl border border-slate-200 bg-white">
        <EmptyState
          title="No accounts found"
          subtitle="Try another filter or create an account."
        />
      </div>
    );
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
        title="Account Details"
        subtitle={selectedAccount?.name}
        details={
          selectedAccount
            ? [
                { label: "Account ID", value: selectedAccount.id },
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
                {
                  label: "Last Updated",
                  value: selectedAccount.updatedAtLabel,
                },
              ]
            : []
        }
      />
    </>
  );
}
