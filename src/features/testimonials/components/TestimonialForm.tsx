import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "../../../components/Modal";
import { outlinedControlClass, OutlinedField } from "../../../components/OutlinedField";
import type { TestimonialApiItem, TestimonialFormValues } from "../types";

const emptyValues: TestimonialFormValues = {
  name: "",
  designation: "",
  feedback: "",
  rating: "5",
  image_url: "",
  status: 1,
};

export function TestimonialForm({
  testimonial,
  open,
  onClose,
  onSave,
}: {
  testimonial: TestimonialApiItem | null;
  open: boolean;
  onClose: () => void;
  onSave: (values: TestimonialFormValues, id?: string | number) => Promise<void>;
}) {
  const [values, setValues] = useState<TestimonialFormValues>(emptyValues);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValues(
      testimonial
        ? {
            name: testimonial.name,
            designation: testimonial.designation,
            feedback: testimonial.feedback,
            rating: String(testimonial.rating || "5"),
            image_url: testimonial.image_url || "",
            status: Number(testimonial.status) === 0 ? 0 : 1,
          }
        : emptyValues,
    );
  }, [testimonial, open]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave(values, testimonial?.id);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={testimonial ? "Edit testimonial" : "Add testimonial"}
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600">
            Cancel
          </button>
          <button form="testimonial-form" type="submit" disabled={saving} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60">
            {saving ? "Saving..." : "Save testimonial"}
          </button>
        </>
      }
    >
      <form id="testimonial-form" onSubmit={submit} className="grid max-h-[65vh] items-start gap-x-4 gap-y-5 overflow-y-auto px-1 pt-3 pb-1 sm:grid-cols-2">
        <OutlinedField label="Name">
          <input required maxLength={191} value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} className={outlinedControlClass} placeholder="Jane Cooper" />
        </OutlinedField>
        <OutlinedField label="Designation">
          <input required maxLength={191} value={values.designation} onChange={(event) => setValues({ ...values, designation: event.target.value })} className={outlinedControlClass} placeholder="Product lead, Northwind" />
        </OutlinedField>
        <OutlinedField label="Rating">
          <select required value={values.rating} onChange={(event) => setValues({ ...values, rating: event.target.value })} className={outlinedControlClass}>
            {["5", "4", "3", "2", "1"].map((rating) => (
              <option key={rating} value={rating}>{rating} star{rating === "1" ? "" : "s"}</option>
            ))}
          </select>
        </OutlinedField>
        <OutlinedField label="Image URL">
          <input type="url" maxLength={191} value={values.image_url} onChange={(event) => setValues({ ...values, image_url: event.target.value })} className={outlinedControlClass} placeholder="https://example.com/photo.jpg" />
        </OutlinedField>
        <OutlinedField label="Feedback" className="sm:col-span-2">
          <textarea required maxLength={191} value={values.feedback} onChange={(event) => setValues({ ...values, feedback: event.target.value })} className={`${outlinedControlClass} min-h-20 resize-y`} placeholder="A short recommendation" />
        </OutlinedField>
        <label className="flex h-10 items-center gap-3 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 sm:col-span-2">
          <input type="checkbox" checked={values.status === 1} onChange={(event) => setValues({ ...values, status: event.target.checked ? 1 : 0 })} className="h-4 w-4 rounded border-slate-300 text-primary-600" />
          Show this testimonial
        </label>
      </form>
    </Modal>
  );
}
