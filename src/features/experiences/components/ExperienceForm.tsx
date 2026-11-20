import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "../../../components/Modal";
import { OutlinedField } from "../../../components/OutlinedField";
import type { ExperienceApiItem, ExperienceFormValues } from "../types";

const emptyValues: ExperienceFormValues = {
  job_title: "",
  company: "",
  location: "",
  description: "",
  start_date: "",
  end_date: "",
  is_current: false,
  image_url: "",
  status: 1,
};
const current = (value: ExperienceApiItem["is_current"]) =>
  value === true || value === 1 || value === "1" || value === "true";

export function ExperienceForm({
  experience,
  open,
  onClose,
  onSave,
}: {
  experience: ExperienceApiItem | null;
  open: boolean;
  onClose: () => void;
  onSave: (values: ExperienceFormValues, id?: string | number) => Promise<void>;
}) {
  const [values, setValues] = useState<ExperienceFormValues>(emptyValues);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    setValues(
      experience
        ? {
            job_title: experience.job_title,
            company: experience.company,
            location: experience.location,
            description: experience.description,
            start_date: experience.start_date,
            end_date: experience.end_date,
            is_current: current(experience.is_current),
            image_url: experience.image_url || "",
            status: Number(experience.status),
          }
        : emptyValues,
    );
  }, [experience, open]);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave(values, experience?.id);
      onClose();
    } finally {
      setSaving(false);
    }
  };
  const input = "h-8 w-full border-0 bg-transparent p-0 text-sm outline-none focus:bg-transparent focus:shadow-none";
  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={experience ? "Edit experience" : "Add experience"}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600"
          >
            Cancel
          </button>
          <button
            form="experience-form"
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save experience"}
          </button>
        </>
      }
    >
      <form
        id="experience-form"
        onSubmit={submit}
        className="max-h-[65vh] space-y-4 overflow-y-auto pr-1"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <OutlinedField label="Job title">
            <input
              required
              maxLength={191}
              value={values.job_title}
              onChange={(e) =>
                setValues({ ...values, job_title: e.target.value })
              }
              className={input}
              placeholder="Senior Product Designer"
            />
          </OutlinedField>
          <OutlinedField label="Company">
            <input
              required
              maxLength={191}
              value={values.company}
              onChange={(e) =>
                setValues({ ...values, company: e.target.value })
              }
              className={input}
              placeholder="Company name"
            />
          </OutlinedField>
          <OutlinedField label="Location">
            <input
              required
              maxLength={191}
              value={values.location}
              onChange={(e) =>
                setValues({ ...values, location: e.target.value })
              }
              className={input}
              placeholder="Dhaka, Bangladesh"
            />
          </OutlinedField>
          <OutlinedField label="Image URL">
            <input
              maxLength={191}
              value={values.image_url}
              onChange={(e) =>
                setValues({ ...values, image_url: e.target.value })
              }
              className={input}
              placeholder="https://example.com/logo.png"
            />
          </OutlinedField>
          <OutlinedField label="Start date">
            <input
              required
              type="date"
              value={values.start_date}
              onChange={(e) =>
                setValues({ ...values, start_date: e.target.value })
              }
              className={input}
            />
          </OutlinedField>
          <OutlinedField label="End date">
            <input
              required
              type="date"
              value={values.end_date}
              onChange={(e) =>
                setValues({ ...values, end_date: e.target.value })
              }
              disabled={values.is_current}
              className={input}
            />
          </OutlinedField>
        </div>
        <OutlinedField label="Description">
          <textarea
            required
            value={values.description}
            onChange={(e) =>
              setValues({ ...values, description: e.target.value })
            }
            className="min-h-28 w-full resize-y border-0 bg-transparent p-0 text-sm outline-none focus:bg-transparent focus:shadow-none"
            placeholder="Describe your responsibilities and accomplishments"
          />
        </OutlinedField>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex h-10 cursor-pointer items-center gap-3 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={values.is_current}
              onChange={(e) =>
                setValues({
                  ...values,
                  is_current: e.target.checked,
                  end_date: e.target.checked ? "Present" : "",
                })
              }
              className="h-4 w-4"
            />
            I currently work here
          </label>
          <label className="flex h-10 cursor-pointer items-center gap-3 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={values.status === 1}
              onChange={(e) =>
                setValues({ ...values, status: e.target.checked ? 1 : 0 })
              }
              className="h-4 w-4"
            />
            Active / visible
          </label>
        </div>
      </form>
    </Modal>
  );
}
