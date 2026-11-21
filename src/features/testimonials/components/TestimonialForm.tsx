import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "../../../components/Modal";
import { outlinedControlClass, OutlinedField } from "../../../components/OutlinedField";
import { resolveBlogImageUrl } from "../../blogs/utils/imageUrl";
import type { TestimonialApiItem, TestimonialFormValues } from "../types";

const emptyValues: TestimonialFormValues = {
  name: "",
  designation: "",
  feedback: "",
  rating: "5",
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
  onSave: (values: TestimonialFormValues, id?: string | number, image?: File | null) => Promise<void>;
}) {
  const [values, setValues] = useState<TestimonialFormValues>(emptyValues);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValues(
      testimonial
        ? {
            name: testimonial.name,
            designation: testimonial.designation,
            feedback: testimonial.feedback,
            rating: String(testimonial.rating || "5"),
            status: Number(testimonial.status) === 0 ? 0 : 1,
          }
        : emptyValues,
    );
    setImage(null);
    setPreview(testimonial?.image_url ? resolveBlogImageUrl(testimonial.image_url) : "");
  }, [testimonial, open]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave(values, testimonial?.id, image);
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
      <form id="testimonial-form" onSubmit={submit} className="grid items-start gap-x-4 gap-y-5 sm:grid-cols-2">
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
        <OutlinedField label="Image">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {preview ? <img src={preview} alt="" className="h-8 w-8 shrink-0 rounded object-cover" /> : null}
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setImage(file);
                setPreview(file ? URL.createObjectURL(file) : testimonial?.image_url ? resolveBlogImageUrl(testimonial.image_url) : "");
              }}
              className="min-w-0 flex-1 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary-50 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-primary-700"
            />
          </div>
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
