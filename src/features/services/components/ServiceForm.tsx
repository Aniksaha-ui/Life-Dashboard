import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "../../../components/Modal";
import { outlinedControlClass, OutlinedField } from "../../../components/OutlinedField";
import type { ServiceApiItem, ServiceFormValues } from "../types";

const emptyValues: ServiceFormValues = {
  title: "",
  description: "",
  icon: "",
  image_url: "",
  price: "",
  status: 1,
};

export function ServiceForm({
  service,
  open,
  onClose,
  onSave,
}: {
  service: ServiceApiItem | null;
  open: boolean;
  onClose: () => void;
  onSave: (values: ServiceFormValues, id?: string | number) => Promise<void>;
}) {
  const [values, setValues] = useState<ServiceFormValues>(emptyValues);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValues(
      service
        ? {
            title: service.title,
            description: service.description,
            icon: service.icon,
            image_url: service.image_url || "",
            price: service.price,
            status: Number(service.status) === 0 ? 0 : 1,
          }
        : emptyValues,
    );
  }, [service, open]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave(values, service?.id);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={service ? "Edit service" : "Add service"}
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600">
            Cancel
          </button>
          <button form="service-form" type="submit" disabled={saving} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60">
            {saving ? "Saving..." : "Save service"}
          </button>
        </>
      }
    >
      <form id="service-form" onSubmit={submit} className="grid max-h-[65vh] items-start gap-x-4 gap-y-5 overflow-y-auto px-1 pt-3 pb-1 sm:grid-cols-2">
        <OutlinedField label="Title">
          <input required maxLength={191} value={values.title} onChange={(event) => setValues({ ...values, title: event.target.value })} className={outlinedControlClass} placeholder="API development" />
        </OutlinedField>
        <OutlinedField label="Price">
          <input required maxLength={191} value={values.price} onChange={(event) => setValues({ ...values, price: event.target.value })} className={outlinedControlClass} placeholder="From 15,000 BDT" />
        </OutlinedField>
        <OutlinedField label="Icon">
          <input required maxLength={191} value={values.icon} onChange={(event) => setValues({ ...values, icon: event.target.value })} className={outlinedControlClass} placeholder="code" />
        </OutlinedField>
        <OutlinedField label="Image URL">
          <input type="url" maxLength={191} value={values.image_url} onChange={(event) => setValues({ ...values, image_url: event.target.value })} className={outlinedControlClass} placeholder="https://example.com/service.jpg" />
        </OutlinedField>
        <OutlinedField label="Description" className="sm:col-span-2">
          <textarea required maxLength={191} value={values.description} onChange={(event) => setValues({ ...values, description: event.target.value })} className={`${outlinedControlClass} min-h-20 resize-y`} placeholder="What this service includes" />
        </OutlinedField>
        <label className="flex h-10 items-center gap-3 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 sm:col-span-2">
          <input type="checkbox" checked={values.status === 1} onChange={(event) => setValues({ ...values, status: event.target.checked ? 1 : 0 })} className="h-4 w-4 rounded border-slate-300 text-primary-600" />
          Show this service
        </label>
      </form>
    </Modal>
  );
}
