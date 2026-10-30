import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  createRecurringExpense,
  getAccounts,
  getCategories,
  getRecurringExpenses,
  runDueRecurringExpenses,
  runRecurringExpense,
  updateRecurringExpense,
} from "../api/queries";
import type { RecurringExpenseFormValues } from "../types";
import { mapRecurringExpense } from "../utils/recurringExpenseMapper";

export function useRecurringExpenses() {
  const [items, setItems] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [plans, accountData, categoryData] = await Promise.all([
        getRecurringExpenses(),
        getAccounts(),
        getCategories(),
      ]);
      setItems(Array.isArray(plans) ? plans : []);
      setAccounts(Array.isArray(accountData) ? accountData : []);
      setCategories(
        (Array.isArray(categoryData) ? categoryData : []).filter(
          (item) => String(item.type).toUpperCase() === "EXPENSE",
        ),
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load recurring expenses.",
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
        .map((item, index) => mapRecurringExpense(item, index + 1))
        .filter(
          (item) =>
            (status === "all" ||
              (status === "active" ? item.is_active : !item.is_active)) &&
            `${item.titleLabel} ${item.note || ""} ${item.accountLabel} ${item.categoryLabel} ${item.frequency}`
              .toLowerCase()
              .includes(search.toLowerCase()),
        ),
    [items, search, status],
  );
  const metrics = useMemo(
    () => ({
      total: rows.length,
      active: rows.filter((item) => item.is_active).length,
      due: rows.filter((item) => item.dueNow).length,
      amount: rows.reduce((total, item) => total + Number(item.amount || 0), 0),
    }),
    [rows],
  );
  const save = async (values: RecurringExpenseFormValues, editing?: any) => {
    const payload = {
      ...values,
      account_id: Number(values.account_id),
      category_id: Number(values.category_id),
      amount: values.amount,
      end_date: values.end_date || null,
    };
    if (editing) await updateRecurringExpense(editing.id, payload);
    else await createRecurringExpense(payload);
    toast.success(
      editing ? "Recurring expense updated." : "Recurring expense created.",
    );
    await refresh();
  };
  const run = async (id: string | number) => {
    await runRecurringExpense(id);
    toast.success("Recurring expense executed.");
    await refresh();
  };
  const runDue = async () => {
    const date = new Date();
    const through = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    await runDueRecurringExpenses(through);
    toast.success("Due recurring expenses executed.");
    await refresh();
  };
  return {
    rows,
    accounts,
    categories,
    status,
    setStatus,
    search,
    setSearch,
    loading,
    metrics,
    refresh,
    save,
    run,
    runDue,
  };
}
