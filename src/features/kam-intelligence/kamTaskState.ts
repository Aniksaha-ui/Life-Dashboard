export const KAM_TASK_ITEMS = [
  "Validate transaction failure reason",
  "Call merchant owner",
  "Log outcome and next follow-up date",
  "Escalate to technical team if error persists",
  "Review settlement and bounce-back history",
  "Confirm merchant recovery plan and next check-in date",
] as const;

export type KamTaskState = {
  completedItems: Record<number, boolean>;
  notes: Record<number, string>;
  completedAt: Record<number, string>;
};

export type CompletedKamTask = {
  idx: number;
  title: string;
  note: string;
  completedAt: string;
};

export function getKamTaskStorageKey(merchantId?: string) {
  return merchantId ? `kam-task-list:${merchantId}` : null;
}

export const emptyKamTaskState = (): KamTaskState => ({
  completedItems: {},
  notes: {},
  completedAt: {},
});

export function getDefaultKamTaskState(): KamTaskState {
  return {
    completedItems: { 0: true, 1: true, 2: true, 3: true },
    notes: {
      0: "Root cause identified: bKash API timeout during peak hours. Merchant notified and monitoring enabled.",
      1: "Called merchant owner (Rahim). Confirmed temporary checkout workaround; agreed to follow up after technical fix.",
      2: "Logged outcome: merchant paused high-value orders. Next follow-up scheduled for 10 Jun 2026.",
      3: "Escalated to technical team. Ticket #TK-4821 opened for bKash integration review.",
    },
    completedAt: {
      0: "2026-06-04T10:30:00.000Z",
      1: "2026-06-02T14:15:00.000Z",
      2: "2026-05-30T11:00:00.000Z",
      3: "2026-05-28T16:45:00.000Z",
    },
  };
}

function isEmptyTaskState(state: KamTaskState) {
  return Object.keys(state.completedItems).length === 0;
}

export function formatKamTaskCompletedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function loadKamTaskState(storageKey: string | null): KamTaskState {
  if (!storageKey) {
    return emptyKamTaskState();
  }

  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return getDefaultKamTaskState();
    const parsed = JSON.parse(stored) as Partial<KamTaskState>;
    const state: KamTaskState = {
      completedItems: parsed.completedItems ?? {},
      notes: parsed.notes ?? {},
      completedAt: parsed.completedAt ?? {},
    };
    if (isEmptyTaskState(state)) return getDefaultKamTaskState();
    return state;
  } catch {
    return getDefaultKamTaskState();
  }
}

export function getCompletedKamTasks(state: KamTaskState): CompletedKamTask[] {
  return KAM_TASK_ITEMS.map((title, idx) => ({
    idx,
    title,
    note: state.notes[idx] || "",
    completedAt: state.completedAt[idx] || "",
  }))
    .filter((task) => state.completedItems[task.idx])
    .sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
    );
}

export function getPendingKamTaskIndices(state: KamTaskState): number[] {
  return KAM_TASK_ITEMS.map((_, idx) => idx).filter(
    (idx) => !state.completedItems[idx],
  );
}
