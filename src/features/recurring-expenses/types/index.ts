export type RecurringExpense = Record<string, any>;

export type RecurringExpenseRow = RecurringExpense & {
  serial: number;
  titleLabel: string;
  accountLabel: string;
  categoryLabel: string;
  frequencyLabel: string;
  amountLabel: string;
  nextRunLabel: string;
  statusLabel: string;
  dueNow: boolean;
};

export type RecurringExpenseFormValues = {
  title: string;
  amount: string;
  account_id: string;
  category_id: string;
  frequency: string;
  is_active: boolean;
  start_date: string;
  next_run_date: string;
  end_date: string;
  note: string;
};
