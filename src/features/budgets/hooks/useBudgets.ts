import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  createBudget,
  deleteBudget,
  getBudgets,
  getCategories,
  updateBudget,
} from "../api/queries";
import type { BudgetApiItem, BudgetFormValues } from "../types";

const today = () => new Date().toISOString().slice(0, 10);
const asNumber = (value: unknown) => Number(value) || 0;

export function useBudgets() {
  const [date, setDate] = useState(today);
  const [budgets, setBudgets] = useState<BudgetApiItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const [budgetData, categoryData] = await Promise.all([
        getBudgets(date),
        getCategories(),
      ]);
      setBudgets(budgetData);
      setCategories(
        (Array.isArray(categoryData) ? categoryData : []).filter(
          (category) => String(category.type || "EXPENSE").toUpperCase() === "EXPENSE",
        ),
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load budgets.");
    } finally {
      setIsLoading(false);
    }
  }, [date]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const totals = useMemo(
    () =>
      budgets.reduce(
        (result, budget) => ({
          planned: result.planned + asNumber(budget.effective_budget ?? budget.amount),
          spent: result.spent + asNumber(budget.spent),
          remaining: result.remaining + asNumber(budget.remaining),
        }),
        { planned: 0, spent: 0, remaining: 0 },
      ),
    [budgets],
  );

  const save = async (values: BudgetFormValues, editing?: BudgetApiItem | null) => {
    if (editing) await updateBudget(editing.id, values);
    else await createBudget(values);
    toast.success(editing ? "Budget updated successfully." : "Budget created successfully.");
    await refresh();
  };

  const remove = async (id: string | number) => {
    await deleteBudget(id);
    toast.success("Budget removed.");
    await refresh();
  };

  return {
    date,
    setDate,
    budgets,
    categories,
    isLoading,
    totals,
    refresh,
    save,
    remove,
  };
}
