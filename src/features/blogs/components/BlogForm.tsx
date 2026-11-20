import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "../../../components/Modal";
import { outlinedControlClass, OutlinedField } from "../../../components/OutlinedField";
import type { BlogApiItem, BlogFormValues } from "../types";

const emptyValues: BlogFormValues = {
  title: "",
  content: "",
  short_description: "",
  category: "react",
  fa_icon: "fa-solid fa-newspaper",
  author_name: "",
  published_date: "",
  isPublished: true,
  image: "",
};

export function BlogForm({
  blog,
  open,
  onClose,
  onSave,
}: {
  blog: BlogApiItem | null;
  open: boolean;
  onClose: () => void;
  onSave: (values: BlogFormValues, id?: string | number) => Promise<void>;
}) {
  const [values, setValues] = useState<BlogFormValues>(emptyValues);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValues(blog ? {
      title: blog.title,
      content: blog.content,
      short_description: blog.short_description,
      category: blog.category || "react",
      fa_icon: blog.fa_icon,
      author_name: blog.author_name,
      published_date: blog.published_date || "",
      isPublished: blog.isPublished === true || blog.isPublished === 1 || blog.isPublished === "1",
      image: blog.image || "",
    } : emptyValues);
  }, [blog, open]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave(values, blog?.id);
      onClose();
    } finally {
      setSaving(false);
    }
  };
  return <Modal isOpen={open} onClose={onClose} title={blog ? "Edit blog post" : "New blog post"} footer={<><button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button><button form="blog-form" type="submit" disabled={saving} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60">{saving ? "Saving..." : "Save post"}</button></>}>
    <form id="blog-form" onSubmit={submit} className="grid max-h-[65vh] items-center gap-4 overflow-y-auto pr-1">
      <OutlinedField label="Title"><input required maxLength={191} value={values.title} onChange={(event) => setValues({ ...values, title: event.target.value })} className={outlinedControlClass} placeholder="A clear, descriptive title" /></OutlinedField>
      <OutlinedField label="Short description"><textarea required value={values.short_description} onChange={(event) => setValues({ ...values, short_description: event.target.value })} className={`${outlinedControlClass} min-h-20 resize-y`} placeholder="A concise summary for listing cards" /></OutlinedField>
      <OutlinedField label="Content"><textarea required value={values.content} onChange={(event) => setValues({ ...values, content: event.target.value })} className={`${outlinedControlClass} min-h-44 resize-y`} placeholder="Write the blog post content" /></OutlinedField>
      <div className="grid items-center gap-4 sm:grid-cols-2">
        <OutlinedField label="Category"><input maxLength={191} value={values.category} onChange={(event) => setValues({ ...values, category: event.target.value })} className={outlinedControlClass} placeholder="react" /></OutlinedField>
        <OutlinedField label="Author"><input required maxLength={191} value={values.author_name} onChange={(event) => setValues({ ...values, author_name: event.target.value })} className={outlinedControlClass} placeholder="Author name" /></OutlinedField>
        <OutlinedField label="Icon class"><input required maxLength={191} value={values.fa_icon} onChange={(event) => setValues({ ...values, fa_icon: event.target.value })} className={outlinedControlClass} placeholder="fa-solid fa-newspaper" /></OutlinedField>
        <OutlinedField label="Published date"><input maxLength={191} value={values.published_date} onChange={(event) => setValues({ ...values, published_date: event.target.value })} className={outlinedControlClass} placeholder="e.g. 17 November 2026" /></OutlinedField>
      </div>
      <OutlinedField label="Image URL"><input type="url" maxLength={255} value={values.image} onChange={(event) => setValues({ ...values, image: event.target.value })} className={outlinedControlClass} placeholder="https://example.com/image.jpg" /></OutlinedField>
      <label className="flex h-10 cursor-pointer items-center gap-3 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700"><input type="checkbox" checked={values.isPublished} onChange={(event) => setValues({ ...values, isPublished: event.target.checked })} className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />Publish this post</label>
    </form>
  </Modal>;
}
