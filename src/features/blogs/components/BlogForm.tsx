import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "../../../components/Modal";
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
  const inputClass = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100";

  return <Modal isOpen={open} onClose={onClose} title={blog ? "Edit blog post" : "New blog post"} footer={<><button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button><button form="blog-form" type="submit" disabled={saving} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60">{saving ? "Saving..." : "Save post"}</button></>}>
    <form id="blog-form" onSubmit={submit} className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
      <label className="block text-sm font-medium text-slate-700">Title<input required maxLength={191} value={values.title} onChange={(event) => setValues({ ...values, title: event.target.value })} className={inputClass} placeholder="A clear, descriptive title" /></label>
      <label className="block text-sm font-medium text-slate-700">Short description<textarea required value={values.short_description} onChange={(event) => setValues({ ...values, short_description: event.target.value })} className={`${inputClass} min-h-20 resize-y`} placeholder="A concise summary for listing cards" /></label>
      <label className="block text-sm font-medium text-slate-700">Content<textarea required value={values.content} onChange={(event) => setValues({ ...values, content: event.target.value })} className={`${inputClass} min-h-44 resize-y`} placeholder="Write the blog post content" /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">Category<input maxLength={191} value={values.category} onChange={(event) => setValues({ ...values, category: event.target.value })} className={inputClass} placeholder="react" /></label>
        <label className="block text-sm font-medium text-slate-700">Author<input required maxLength={191} value={values.author_name} onChange={(event) => setValues({ ...values, author_name: event.target.value })} className={inputClass} placeholder="Author name" /></label>
        <label className="block text-sm font-medium text-slate-700">Font Awesome icon<input required maxLength={191} value={values.fa_icon} onChange={(event) => setValues({ ...values, fa_icon: event.target.value })} className={inputClass} placeholder="fa-solid fa-newspaper" /></label>
        <label className="block text-sm font-medium text-slate-700">Published date<input maxLength={191} value={values.published_date} onChange={(event) => setValues({ ...values, published_date: event.target.value })} className={inputClass} placeholder="e.g. 17 November 2026" /></label>
      </div>
      <label className="block text-sm font-medium text-slate-700">Image URL<input type="url" maxLength={255} value={values.image} onChange={(event) => setValues({ ...values, image: event.target.value })} className={inputClass} placeholder="https://example.com/image.jpg" /></label>
      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700"><input type="checkbox" checked={values.isPublished} onChange={(event) => setValues({ ...values, isPublished: event.target.checked })} className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />Publish this post</label>
    </form>
  </Modal>;
}
