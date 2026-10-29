import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  createTransfer,
  getAccounts,
  getTransfers,
  updateTransfer,
  withdrawToCash,
} from "../api/queries";

export function useTransfers() {
  const [items, setItems] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [flow, setFlow] = useState("all");
  const [accountId, setAccountId] = useState("all");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [transfers, nextAccounts] = await Promise.all([
        getTransfers(),
        getAccounts(),
      ]);
      setItems(Array.isArray(transfers) ? transfers : transfers?.data || []);
      setAccounts(
        Array.isArray(nextAccounts) ? nextAccounts : nextAccounts?.data || [],
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load transfers.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  const rows = useMemo(
    () =>
      items
        .filter((item) => {
          const withdrawal = Boolean(item.is_withdrawal);
          const date = String(item.transfer_date || "").slice(0, 10);
          const matches =
            flow === "all" ||
            (flow === "withdrawal" ? withdrawal : !withdrawal);
          const matchesAccount =
            accountId === "all" ||
            String(item.from_account?.id || item.from_account_id) ===
              accountId ||
            String(item.to_account?.id || item.to_account_id) === accountId;
          const text =
            `${item.id} ${item.note} ${item.from_account?.name} ${item.to_account?.name}`.toLowerCase();
          return (
            matches &&
            matchesAccount &&
            (!fromDate || date >= fromDate) &&
            (!toDate || date <= toDate) &&
            text.includes(search.toLowerCase())
          );
        })
        .map((item, index) => ({
          ...item,
          serial: index + 1,
          withdrawal: Boolean(item.is_withdrawal),
          fromName: item.from_account?.name || "N/A",
          toName: item.to_account?.name || "N/A",
          dateLabel: item.transfer_date
            ? new Date(item.transfer_date).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "N/A",
          amountLabel: `BDT ${Number(item.amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        })),
    [items, flow, accountId, search, fromDate, toDate],
  );
  const metrics = useMemo(
    () => ({
      total: items.length,
      transfer: items.filter((item) => !item.is_withdrawal).length,
      withdrawal: items.filter((item) => item.is_withdrawal).length,
      amount: items.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    }),
    [items],
  );
  const save = async (
    mode: "TRANSFER" | "WITHDRAWAL",
    values: any,
    id?: string | number,
  ) => {
    const payload = {
      from_account_id: Number(values.from_account_id),
      to_account_id: Number(values.to_account_id),
      amount: values.amount,
      note: values.note || null,
      transfer_date: values.transfer_date || undefined,
    };
    if (id) await updateTransfer(id, payload);
    else if (mode === "WITHDRAWAL") await withdrawToCash(payload);
    else await createTransfer(payload);
    toast.success(
      id
        ? "Transfer updated successfully."
        : mode === "WITHDRAWAL"
          ? "Withdrawal completed successfully."
          : "Transfer completed successfully.",
    );
    await refresh();
  };
  return {
    rows,
    accounts,
    metrics,
    flow,
    setFlow,
    accountId,
    setAccountId,
    search,
    setSearch,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    loading,
    refresh,
    save,
  };
}
