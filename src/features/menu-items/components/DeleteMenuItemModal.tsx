import { useState } from "react";
import { toast } from "react-hot-toast";
import { Modal } from "../../../components/Modal";
import type { MenuItemRow } from "../types";

interface DeleteMenuItemModalProps {
  menuItem: MenuItemRow | null;
  onClose: () => void;
  onConfirm: (id: number) => Promise<void>;
}

export function DeleteMenuItemModal({
  menuItem,
  onClose,
  onConfirm,
}: DeleteMenuItemModalProps) {
  const [deleting, setDeleting] = useState(false);

  const confirm = async () => {
    if (!menuItem) return;
    setDeleting(true);
    try {
      await onConfirm(menuItem.id);
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete menu item.",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={Boolean(menuItem)}
      onClose={onClose}
      title="Delete Menu Item"
      size="sm"
      footer={
        <>
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600"
          >
            Cancel
          </button>
          <button
            onClick={() => void confirm()}
            disabled={deleting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </>
      }
    >
      <p className="text-sm text-slate-600">
        Are you sure you want to delete{" "}
        <span className="font-semibold text-slate-900">{menuItem?.title}</span>?
        Any nested child items will be deleted too. This cannot be undone.
      </p>
    </Modal>
  );
}
