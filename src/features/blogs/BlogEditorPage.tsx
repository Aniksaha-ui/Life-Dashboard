import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  FileText,
  Plus,
  Save,
  Smartphone,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { createBlog, getBlog, updateBlog } from "./api/queries";
import { RichTextEditor } from "./components/RichTextEditor";
import { outlinedControlClass, OutlinedField } from "../../components/OutlinedField";
import type { BlogComponent, BlogComponentType, BlogFormValues } from "./types";
import {
  createBlock,
  generateBlogHtml,
  parseBlocks,
  toPayload,
} from "./utils/blogBuilder";
import { resolveBlogImageUrl } from "./utils/imageUrl";

const blank: BlogFormValues = {
  title: "",
  content: "",
  short_description: "",
  category: "react",
  fa_icon: "fa-solid fa-newspaper",
  author_name: "",
  published_date: "",
  isPublished: false,
  image: "",
};
const types: { type: BlogComponentType; label: string; icon: string }[] = [
  { type: "header", label: "Header", icon: "H1" },
  { type: "subheader", label: "Subheader", icon: "H2" },
  { type: "paragraph", label: "Paragraph", icon: "P" },
  { type: "image", label: "Image", icon: "IMG" },
  { type: "quote", label: "Quote", icon: "\u201c\u201d" },
  { type: "code", label: "Code block", icon: "</>" },
  { type: "highlight", label: "Highlight", icon: "\u2605" },
  { type: "footer", label: "Footer", icon: "\u2014" },
];
function Block({
  block,
  index,
  length,
  update,
  move,
  remove,
}: {
  block: BlogComponent;
  index: number;
  length: number;
  update: (next: Partial<BlogComponent>) => void;
  move: (step: number) => void;
  remove: () => void;
}) {
  const setSetting = (key: keyof BlogComponent["settings"], value: string) =>
    update({ settings: { ...block.settings, [key]: value } });
  const label =
    types.find((item) => item.type === block.type)?.label ?? "Block";
  const simple = block.type === "header" || block.type === "subheader";
  return (
    <article className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
        <div>
          <p className="font-semibold text-slate-800">{label}</p>
          <p className="text-xs text-slate-400">Block {index + 1}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {(
            [
              ["left", AlignLeft],
              ["center", AlignCenter],
              ["right", AlignRight],
            ] as const
          ).map(([value, Icon]) => (
            <button
              key={value}
              type="button"
              title={`Align ${value}`}
              onClick={() => setSetting("alignment", value)}
              className={`rounded-md p-2 ${block.settings.alignment === value ? "bg-primary-100 text-primary-700" : "text-slate-500 hover:bg-slate-100"}`}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
          <label className="ml-1 flex items-center gap-1 rounded border border-slate-200 px-1.5 py-1 text-xs text-slate-500">
            Text
            <input
              aria-label="Text color"
              type="color"
              value={block.settings.color || "#0f172a"}
              onChange={(e) => setSetting("color", e.target.value)}
            />
          </label>
          <label className="flex items-center gap-1 rounded border border-slate-200 px-1.5 py-1 text-xs text-slate-500">
            Bg
            <input
              aria-label="Background color"
              type="color"
              value={block.settings.backgroundColor || "#ffffff"}
              onChange={(e) => setSetting("backgroundColor", e.target.value)}
            />
          </label>
          <button
            type="button"
            disabled={!index}
            onClick={() => move(-1)}
            className="p-2 text-slate-500 disabled:opacity-30"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={index === length - 1}
            onClick={() => move(1)}
            className="p-2 text-slate-500 disabled:opacity-30"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={remove}
            className="p-2 text-rose-600 hover:bg-rose-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </header>
      <div className="p-4">
        {block.type === "image" ? (
          <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
            <div className="space-y-3">
              <OutlinedField label="Image URL">
                <input
                  value={block.content}
                  onChange={(e) => update({ content: e.target.value })}
                  className={outlinedControlClass}
                  placeholder="https://example.com/image.jpg"
                />
              </OutlinedField>
              <OutlinedField label="Caption">
                <input
                  value={block.settings.caption || ""}
                  onChange={(e) => setSetting("caption", e.target.value)}
                  className={outlinedControlClass}
                  placeholder="Optional caption"
                />
              </OutlinedField>
            </div>
            <div className="flex min-h-28 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-xs text-slate-400">
              {block.content ? (
                <img
                  src={block.content}
                  alt="Block preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                "Image preview"
              )}
            </div>
          </div>
        ) : block.type === "paragraph" ? (
          <RichTextEditor
            value={block.content}
            onChange={(content) => update({ content })}
          />
        ) : (
          <OutlinedField label={label}>
            {simple ? (
              <input
                value={block.content}
                onChange={(e) => update({ content: e.target.value })}
                className={outlinedControlClass}
                placeholder={`Enter ${label.toLowerCase()}`}
              />
            ) : (
              <textarea
                value={block.content}
                onChange={(e) => update({ content: e.target.value })}
                rows={block.type === "code" ? 7 : 4}
                className={`${outlinedControlClass} resize-y ${block.type === "code" ? "font-mono text-xs" : ""}`}
                placeholder={`Write ${label.toLowerCase()} content...`}
              />
            )}
          </OutlinedField>
        )}
      </div>
    </article>
  );
}

export default function BlogEditorPage() {
  const navigate = useNavigate();
  const { blogId } = useParams();
  const [values, setValues] = useState(blank);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [blocks, setBlocks] = useState<BlogComponent[]>([]);
  const [existingContent, setExistingContent] = useState("");
  const [loading, setLoading] = useState(Boolean(blogId));
  const [saving, setSaving] = useState(false);
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    if (!blogId) return;
    void (async () => {
      try {
        const blog = await getBlog(blogId);
        setValues({
          title: blog.title || "",
          content: blog.content || "",
          short_description: blog.short_description || "",
          category: blog.category || "react",
          fa_icon: blog.fa_icon || "fa-solid fa-newspaper",
          author_name: blog.author_name || "",
          published_date: blog.published_date || "",
          isPublished:
            blog.isPublished === true ||
            blog.isPublished === 1 ||
            blog.isPublished === "1",
          image: resolveBlogImageUrl(blog.image),
        });
        setExistingContent(blog.content || "");
        setBlocks(parseBlocks(blog));
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Unable to load blog post.",
        );
        navigate("/blogs", { replace: true });
      } finally {
        setLoading(false);
      }
    })();
  }, [blogId, navigate]);
  const html = useMemo(() => generateBlogHtml(blocks), [blocks]);
  const updateBlock = (id: string, next: Partial<BlogComponent>) =>
    setBlocks((current) =>
      current.map((block) => (block.id === id ? { ...block, ...next } : block)),
    );
  const move = (index: number, step: number) =>
    setBlocks((current) => {
      const target = index + step;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      const [block] = next.splice(index, 1);
      next.splice(target, 0, block);
      return next;
    });
  const selectCoverImage = (file?: File) => {
    if (!file) return;
    setCoverImage(file);
    setValues((current) => ({ ...current, image: URL.createObjectURL(file) }));
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!values.title.trim()) return toast.error("Blog title is required.");
    if (!blocks.length && !blogId)
      return toast.error("Add at least one content block before saving.");
    try {
      setSaving(true);
      const payload = blocks.length
        ? toPayload(values, blocks)
        : {
            ...values,
            content: existingContent,
            components_json: JSON.stringify([]),
          };
      if (blogId) {
        await updateBlog(blogId, payload, coverImage);
        toast.success("Blog post updated successfully.");
      } else {
        await createBlog(payload, coverImage);
        toast.success("Blog post created successfully.");
      }
      navigate("/blogs");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save blog post.",
      );
    } finally {
      setSaving(false);
    }
  };
  if (loading)
    return (
      <div className="flex min-h-96 items-center justify-center text-sm text-slate-500">
        Loading blog builder...
      </div>
    );
  return (
    <form onSubmit={submit} className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/blogs")}
            className="rounded-lg border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
              <FileText className="h-6 w-6 text-primary-600" />
              {blogId ? "Edit blog" : "Create blog"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Build the article with content blocks and preview it before
              publishing.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600">
            {blocks.length} blocks
          </span>
          <button
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save blog"}
          </button>
        </div>
      </header>
      <div className="grid gap-6 2xl:grid-cols-[250px_minmax(0,1fr)_minmax(300px,.8fr)]">
        <aside>
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="font-bold text-slate-800">Builder toolbox</h2>
            <p className="mt-1 text-xs text-slate-500">
              Add reusable content blocks.
            </p>
            <div className="mt-4 space-y-2">
              {types.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() =>
                    setBlocks((current) => [...current, createBlock(item.type)])
                  }
                  className="flex w-full items-center gap-3 rounded-lg border border-slate-200 p-3 text-left hover:border-primary-300 hover:bg-primary-50"
                >
                  <span className="grid h-8 w-8 place-items-center rounded bg-slate-100 text-xs font-bold text-primary-700">
                    {item.icon}
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {item.label}
                  </span>
                  <Plus className="ml-auto h-4 w-4 text-primary-600" />
                </button>
              ))}
            </div>
          </section>
        </aside>
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-800">Blog metadata</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <OutlinedField label="Title" className="sm:col-span-2">
                <input
                  required
                  value={values.title}
                  onChange={(e) =>
                    setValues({ ...values, title: e.target.value })
                  }
                  className="h-8 w-full border-0 bg-transparent p-0 text-sm outline-none focus:bg-transparent focus:shadow-none"
                />
              </OutlinedField>
              <OutlinedField label="Author">
                <input
                  required
                  value={values.author_name}
                  onChange={(e) =>
                    setValues({ ...values, author_name: e.target.value })
                  }
                  className="h-8 w-full border-0 bg-transparent p-0 text-sm outline-none focus:bg-transparent focus:shadow-none"
                />
              </OutlinedField>
              <OutlinedField label="Category">
                <input
                  value={values.category}
                  onChange={(e) =>
                    setValues({ ...values, category: e.target.value })
                  }
                  className="h-8 w-full border-0 bg-transparent p-0 text-sm outline-none focus:bg-transparent focus:shadow-none"
                />
              </OutlinedField>
              <OutlinedField label="Publish date">
                <input
                  type="date"
                  value={values.published_date}
                  onChange={(e) =>
                    setValues({ ...values, published_date: e.target.value })
                  }
                  className="h-8 w-full border-0 bg-transparent p-0 text-sm outline-none focus:bg-transparent focus:shadow-none"
                />
              </OutlinedField>
              <OutlinedField label="Icon class">
                <input
                  required
                  value={values.fa_icon}
                  onChange={(e) =>
                    setValues({ ...values, fa_icon: e.target.value })
                  }
                  className="h-8 w-full border-0 bg-transparent p-0 text-sm outline-none focus:bg-transparent focus:shadow-none"
                />
              </OutlinedField>
              <OutlinedField label="Cover image" className="sm:col-span-2">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={(e) => selectCoverImage(e.target.files?.[0])}
                  className="w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary-50 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-primary-700"
                />
                <span className="mt-1 block text-xs font-normal text-slate-500">
                  Upload a PNG, JPG, WEBP, or GIF image (up to 5 MB).
                </span>
              </OutlinedField>
              <OutlinedField
                label="Short description"
                className="sm:col-span-2"
              >
                <textarea
                  required
                  rows={3}
                  value={values.short_description}
                  onChange={(e) =>
                    setValues({ ...values, short_description: e.target.value })
                  }
                  className="min-h-24 w-full resize-y border-0 bg-transparent p-0 text-sm outline-none focus:bg-transparent focus:shadow-none"
                />
              </OutlinedField>
              <label className="flex h-10 items-center gap-3 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={values.isPublished}
                  onChange={(e) =>
                    setValues({ ...values, isPublished: e.target.checked })
                  }
                />
                Publish this post
              </label>
            </div>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-800">Content canvas</h2>
            <p className="mt-1 text-sm text-slate-500">
              Style, reorder, and remove article blocks.
            </p>
            <div className="mt-5 space-y-4">
              {blocks.length ? (
                blocks.map((block, index) => (
                  <Block
                    key={block.id}
                    block={block}
                    index={index}
                    length={blocks.length}
                    update={(next) => updateBlock(block.id, next)}
                    move={(step) => move(index, step)}
                    remove={() =>
                      setBlocks((current) =>
                        current.filter((item) => item.id !== block.id),
                      )
                    }
                  />
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center text-sm text-slate-500">
                  Choose a block from the toolbox to start building.
                </div>
              )}
            </div>
          </section>
        </div>
        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-4 shadow-sm 2xl:sticky 2xl:top-6">
          <div className="flex justify-between">
            <div>
              <h2 className="font-bold text-slate-800">Live preview</h2>
              <p className="text-xs text-slate-500">Reader-facing article</p>
            </div>
            <button
              type="button"
              onClick={() => setMobile(!mobile)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
              title="Toggle mobile preview"
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>
          <div
            className={`mx-auto mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white ${mobile ? "max-w-[360px]" : "w-full"}`}
          >
            <div className="border-b border-slate-100 p-5">
              <h3 className="text-lg font-bold text-slate-900">
                {values.title || "Blog title"}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {values.author_name || "Author"}
                {values.published_date ? ` · ${values.published_date}` : ""}
              </p>
            </div>
            {values.image && (
              <img
                src={values.image}
                alt="Cover preview"
                className="h-36 w-full object-cover"
              />
            )}
            <div
              className="p-5 text-sm"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </aside>
      </div>
    </form>
  );
}
