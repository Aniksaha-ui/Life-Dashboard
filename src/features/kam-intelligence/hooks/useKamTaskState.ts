import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  getCompletedKamTasks,
  getKamTaskStorageKey,
  getPendingKamTaskIndices,
  loadKamTaskState,
  type KamTaskState,
} from "../kamTaskState";

export function useKamTaskState(
  merchantId?: string,
  options?: { onTasksChange?: () => void },
) {
  const storageKey = getKamTaskStorageKey(merchantId);
  const [completedItems, setCompletedItems] = useState<Record<number, boolean>>(
    {},
  );
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [completedAt, setCompletedAt] = useState<Record<number, string>>({});
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [tempNote, setTempNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const state = loadKamTaskState(storageKey);
    setCompletedItems(state.completedItems);
    setNotes(state.notes);
    setCompletedAt(state.completedAt);
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey) return;
    const state: KamTaskState = { completedItems, notes, completedAt };
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [storageKey, completedItems, notes, completedAt]);

  const taskState = useMemo(
    () => ({ completedItems, notes, completedAt }),
    [completedItems, notes, completedAt],
  );

  const completedTasks = useMemo(
    () => getCompletedKamTasks(taskState),
    [taskState],
  );
  const pendingIndices = useMemo(
    () => getPendingKamTaskIndices(taskState),
    [taskState],
  );
  const completedCount = completedTasks.length;

  const handleItemClick = (idx: number) => {
    if (completedItems[idx]) return;
    if (editingIdx === idx) return;
    setEditingIdx(idx);
    setTempNote(notes[idx] || "");
    setError(null);
  };

  const handleDone = (idx: number) => {
    if (!tempNote.trim()) {
      setError("Please enter a note before completing");
      return;
    }
    setCompletedItems((prev) => ({ ...prev, [idx]: true }));
    setNotes((prev) => ({ ...prev, [idx]: tempNote }));
    setCompletedAt((prev) => ({ ...prev, [idx]: new Date().toISOString() }));
    setEditingIdx(null);
    setTempNote("");
    setError(null);
    toast.success("Task completed");
    options?.onTasksChange?.();
  };

  const handleCancel = () => {
    setEditingIdx(null);
    setTempNote("");
    setError(null);
  };

  return {
    completedItems,
    notes,
    completedAt,
    completedTasks,
    pendingIndices,
    completedCount,
    editingIdx,
    tempNote,
    error,
    setTempNote,
    setError,
    handleItemClick,
    handleDone,
    handleCancel,
  };
}

export type UseKamTaskStateReturn = ReturnType<typeof useKamTaskState>;
