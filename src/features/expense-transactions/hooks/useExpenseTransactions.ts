import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  createBulkLedgerEntries,
  createLedgerEntry,
  getAccounts,
  getCategories,
  getLedger,
  updateLedgerEntry,
} from "../api/queries";

const toDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
const getCurrentMonthDateRange = () => {
  const today = new Date();
  return {
    fromDate: toDateInput(new Date(today.getFullYear(), today.getMonth(), 1)),
    toDate: toDateInput(today),
  };
};

export function useExpenseTransactions() {
  const defaultDateRange = useMemo(() => getCurrentMonthDateRange(), []);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [type, setType] = useState("all");
  const [accountFilter, setAccountFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState(defaultDateRange.fromDate);
  const [toDate, setToDate] = useState(defaultDateRange.toDate);
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
  const filteredTransactions = useMemo(
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
        .filter(
          (item) =>
            accountFilter === "all" ||
            String(item.account_id ?? item.account?.id) === accountFilter,
        )
        .filter(
          (item) =>
            categoryFilter === "all" ||
            String(item.category_id ?? item.category?.id) === categoryFilter,
        ),
    [
      transactions,
      type,
      search,
      fromDate,
      toDate,
      accountFilter,
      categoryFilter,
    ],
  );
  const rows = useMemo(
    () =>
      filteredTransactions.map((item, index) => ({
        ...item,
        serial: index + 1,
        type: String(item.type || "EXPENSE").toUpperCase(),
        accountName: item.account?.name || "N/A",
        categoryName:
          item.category?.name ||
          (String(item.type).toUpperCase() === "DEPOSIT"
            ? "No category required"
            : "Uncategorized"),
        accountTypeLabel: item.account?.type || item.account_type || "N/A",
        categoryTypeLabel: item.category?.type || "N/A",
        amountLabel: `BDT ${Number(item.amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        balanceBeforeLabel: `BDT ${Number(item.balance_before ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        balanceAfterLabel: `BDT ${Number(item.balance_after ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        referenceLabel:
          item.reference || item.reference_number || "No reference",
        dateLabel: item.transaction_date
          ? new Date(item.transaction_date).toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "N/A",
      })),
    [filteredTransactions],
  );
  const metrics = useMemo(
    () => ({
      total: filteredTransactions.length,
      expense: filteredTransactions
        .filter((item) => String(item.type).toUpperCase() === "EXPENSE")
        .reduce((sum, item) => sum + Number(item.amount || 0), 0),
      recurring: filteredTransactions
        .filter((item) => String(item.type).toUpperCase() === "RECURRING")
        .reduce((sum, item) => sum + Number(item.amount || 0), 0),
      income: filteredTransactions
        .filter((item) => String(item.type).toUpperCase() === "INCOME")
        .reduce((sum, item) => sum + Number(item.amount || 0), 0),
      deposit: filteredTransactions
        .filter((item) => String(item.type).toUpperCase() === "DEPOSIT")
        .reduce((sum, item) => sum + Number(item.amount || 0), 0),
    }),
    [filteredTransactions],
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
  const update = async (
    id: string | number,
    entryType: string,
    values: any,
  ) => {
    await updateLedgerEntry(id, {
      account_id: Number(values.account_id),
      amount: values.amount,
      note: values.note || null,
      transaction_date: values.transaction_date || undefined,
      ...(entryType !== "DEPOSIT" && values.category_id
        ? { category_id: Number(values.category_id) }
        : {}),
    });
    toast.success("Transaction updated successfully.");
    await refresh();
  };
  return {
    rows,
    accounts,
    categories,
    type,
    setType,
    accountFilter,
    setAccountFilter,
    categoryFilter,
    setCategoryFilter,
    search,
    setSearch,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    defaultDateRange,
    loading,
    metrics,
    refresh,
    create,
    createBulk,
    update,
  };
}
