import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "../../../components/Modal";
import { outlinedControlClass, OutlinedField } from "../../../components/OutlinedField";
import { resolveBlogImageUrl } from "../../blogs/utils/imageUrl";
import type { TrainingApiItem, TrainingFormValues } from "../types";

const emptyValues: TrainingFormValues = {
  title: "",
  provider: "",
  description: "",
  start_date: "",
  end_date: "",
  certificate_url: "",
  status: 1,
};

const dateValue = (value: string) => (/^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : value);

export function TrainingForm({
  training,
  open,
  onClose,
  onSave,
}: {
  training: TrainingApiItem | null;
  open: boolean;
  onClose: () => void;
  onSave: (values: TrainingFormValues, id?: string | number, image?: File | null) => Promise<void>;
}) {
  const [values, setValues] = useState<TrainingFormValues>(emptyValues);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [imageError, setImageError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValues(
      training
        ? {
            title: training.title,
            provider: training.provider,
            description: training.description,
            start_date: dateValue(training.start_date),
            end_date: dateValue(training.end_date),
            certificate_url: training.certificate_url,
            status: Number(training.status) === 0 ? 0 : 1,
          }
        : emptyValues,
    );
    setImage(null);
    setPreview(training?.image_url ? resolveBlogImageUrl(training.image_url) : "");
    setImageError("");
  }, [training, open]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!training?.image_url && !image) {
      setImageError("Choose an image to upload.");
      return;
    }
    setImageError("");
    setSaving(true);
    try {
      await onSave(values, training?.id, image);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={training ? "Edit training" : "Add training"}
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600">
            Cancel
          </button>
          <button form="training-form" type="submit" disabled={saving} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60">
            {saving ? "Saving..." : "Save training"}
          </button>
        </>
      }
    >
      <form id="training-form" onSubmit={submit} className="grid max-h-[65vh] items-start gap-x-4 gap-y-5 overflow-y-auto px-1 pt-3 pb-1 sm:grid-cols-2">
        <OutlinedField label="Title">
          <input required maxLength={191} value={values.title} onChange={(event) => setValues({ ...values, title: event.target.value })} className={outlinedControlClass} placeholder="Laravel architecture" />
        </OutlinedField>
        <OutlinedField label="Provider">
          <input required maxLength={191} value={values.provider} onChange={(event) => setValues({ ...values, provider: event.target.value })} className={outlinedControlClass} placeholder="Laracasts" />
        </OutlinedField>
        <OutlinedField label="Start date">
          <input required type="date" maxLength={191} value={values.start_date} onChange={(event) => setValues({ ...values, start_date: event.target.value })} className={outlinedControlClass} />
        </OutlinedField>
        <OutlinedField label="End date">
          <input required type="date" maxLength={191} value={values.end_date} onChange={(event) => setValues({ ...values, end_date: event.target.value })} className={outlinedControlClass} />
        </OutlinedField>
        <OutlinedField label="Certificate URL">
          <input required type="url" maxLength={191} value={values.certificate_url} onChange={(event) => setValues({ ...values, certificate_url: event.target.value })} className={outlinedControlClass} placeholder="https://example.com/certificate" />
        </OutlinedField>
        <div className="min-w-0">
          <OutlinedField label="Image">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {preview ? <img src={preview} alt="" className="h-8 w-8 shrink-0 rounded object-cover" /> : null}
              <input
                type="file"
                accept="image/*"
                required={!training?.image_url}
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setImage(file);
                  setImageError("");
                  setPreview(file ? URL.createObjectURL(file) : training?.image_url ? resolveBlogImageUrl(training.image_url) : "");
                }}
                className="min-w-0 flex-1 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary-50 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-primary-700"
              />
            </div>
          </OutlinedField>
          {imageError ? <p className="mt-1 text-xs font-medium text-rose-600">{imageError}</p> : null}
        </div>
        <OutlinedField label="Description" className="sm:col-span-2">
          <textarea required maxLength={191} value={values.description} onChange={(event) => setValues({ ...values, description: event.target.value })} className={`${outlinedControlClass} min-h-20 resize-y`} placeholder="What this training covered" />
        </OutlinedField>
        <label className="flex h-10 items-center gap-3 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 sm:col-span-2">
          <input type="checkbox" checked={values.status === 1} onChange={(event) => setValues({ ...values, status: event.target.checked ? 1 : 0 })} className="h-4 w-4 rounded border-slate-300 text-primary-600" />
          Show this training
        </label>
      </form>
    </Modal>
  );
}
