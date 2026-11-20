import { ArrowLeft, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { getBlog } from "./api/queries";
import type { BlogApiItem } from "./types";
import { resolveBlogImageUrl } from "./utils/imageUrl";

function LoadingPreview() {
  return <div className="mx-auto max-w-4xl animate-pulse space-y-5"><div className="h-5 w-28 rounded bg-slate-200" /><div className="min-h-96 rounded-2xl border border-slate-200 bg-white" /></div>;
}

export default function BlogPreviewPage() {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<BlogApiItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      if (!blogId) return;
      try { setBlog(await getBlog(blogId)); }
      catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load blog post.");
        navigate("/blogs", { replace: true });
      } finally { setLoading(false); }
    })();
  }, [blogId, navigate]);

  if (loading) return <LoadingPreview />;
  if (!blog) return null;

  return <article className="mx-auto max-w-4xl pb-8">
    <div className="mb-5 flex items-center justify-between gap-3"><button type="button" onClick={() => navigate("/blogs")} className="inline-flex items-center gap-2 rounded-lg px-1 py-2 text-sm font-bold text-slate-600 transition hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-200"><ArrowLeft className="h-4 w-4" />All posts</button><button type="button" onClick={() => navigate(`/blogs/${blog.id}/edit`)} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"><Pencil className="h-4 w-4" />Edit post</button></div>
    <main className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">{blog.image && <img src={resolveBlogImageUrl(blog.image)} alt={`${blog.title} cover`} className="h-56 w-full object-cover sm:h-80" />}<div className="px-6 py-8 sm:px-12 sm:py-11"><div className="blog-preview-content mx-auto max-w-2xl" dangerouslySetInnerHTML={{ __html: blog.content || "<p>No article content was provided.</p>" }} /></div></main>
  </article>;
}
