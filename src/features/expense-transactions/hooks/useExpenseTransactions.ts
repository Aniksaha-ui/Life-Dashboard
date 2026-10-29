import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  createBulkLedgerEntries,
  createLedgerEntry,
  getAccounts,
  getCategories,
  getLedger,
} from "../api/queries";

const toDateInput = (date: Date) => date.toISOString().slice(0, 10);
const getCurrentMonthDateRange = () => {
  const today = new Date();
  return {
    fromDate: toDateInput(new Date(today.getFullYear(), today.getMonth(), 1)),
    toDate: toDateInput(today),
  };
};

export function useExpenseTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [type, setType] = useState("all");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState(
    () => getCurrentMonthDateRange().fromDate,
  );
  const [toDate, setToDate] = useState(() => getCurrentMonthDateRange().toDate);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [nextTransactions, nextAccounts, nextCategories] =
        await Promise.all([getLedger(), getAccounts(), getCategories()]);
      setTransactions(
        Array.isArray(nextTransactions)
          ? nextTransactions
          : nextTransactions?.data || [],
      );
      setAccounts(
        Array.isArray(nextAccounts) ? nextAccounts : nextAccounts?.data || [],
      );
      setCategories(
        Array.isArray(nextCategories)
          ? nextCategories
          : nextCategories?.data || [],
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load transactions.",
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
      transactions
        .filter(
          (item) => type === "all" || String(item.type).toUpperCase() === type,
        )
        .filter((item) =>
          `${item.id} ${item.type} ${item.note} ${item.account?.name} ${item.category?.name}`
            .toLowerCase()
            .includes(search.toLowerCase()),
        )
        .filter((item) => {
          const date = String(item.transaction_date || "").slice(0, 10);
          if (!date) return !fromDate && !toDate;
          return (!fromDate || date >= fromDate) && (!toDate || date <= toDate);
        })
        .map((item, index) => ({
          ...item,
          serial: index + 1,
          type: String(item.type || "EXPENSE").toUpperCase(),
          accountName: item.account?.name || "N/A",
          categoryName:
            item.category?.name ||
            (String(item.type).toUpperCase() === "DEPOSIT"
              ? "No category required"
              : "Uncategorized"),
          amountLabel: `BDT ${Number(item.amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
          dateLabel: item.transaction_date
            ? new Date(item.transaction_date).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "N/A",
        })),
    [transactions, type, search, fromDate, toDate],
  );
  const metrics = useMemo(
    () => ({
      total: transactions.length,
      expense: transactions
        .filter((item) => String(item.type).toUpperCase() === "EXPENSE")
        .reduce((sum, item) => sum + Number(item.amount || 0), 0),
      income: transactions
        .filter((item) => String(item.type).toUpperCase() === "INCOME")
        .reduce((sum, item) => sum + Number(item.amount || 0), 0),
      deposit: transactions
        .filter((item) => String(item.type).toUpperCase() === "DEPOSIT")
        .reduce((sum, item) => sum + Number(item.amount || 0), 0),
    }),
    [transactions],
  );
  const create = async (entryType: string, values: any) => {
    await createLedgerEntry(entryType, {
      account_id: Number(values.account_id),
      amount: values.amount,
      note: values.note || null,
      transaction_date: values.transaction_date || undefined,
      ...(entryType !== "DEPOSIT" && values.category_id
        ? { category_id: Number(values.category_id) }
        : {}),
    });
    toast.success("Transaction created successfully.");
    await refresh();
  };
  const createBulk = async (values: any[]) => {
    await createBulkLedgerEntries(
      values.map(({ entry_type, ...value }) => ({
        entry_type,
        account_id: Number(value.account_id),
        amount: value.amount,
        note: value.note || null,
        transaction_date: value.transaction_date || undefined,
        ...(entry_type !== "DEPOSIT" && value.category_id
          ? { category_id: Number(value.category_id) }
          : {}),
      })),
    );
    toast.success("Transactions created successfully.");
    await refresh();
  };
  return {
    rows,
    accounts,
    categories,
    type,
    setType,
    search,
    setSearch,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    loading,
    metrics,
    refresh,
    create,
    createBulk,
  };
}
