import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { createBlog, deleteBlog, getBlog, getBlogs, updateBlog } from "../api/queries";
import type { BlogApiItem, BlogFormValues } from "../types";
import { mapBlog } from "../utils/blogMapper";

export function useBlogs() {
  const [items, setItems] = useState<BlogApiItem[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useCallback(async () => {
    setIsLoading(true);
    try { setItems((await getBlogs()).rows); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Unable to load blog posts."); }
    finally { setIsLoading(false); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  const rows = useMemo(() => items.filter((item) => {
    const matchesSearch = `${item.title} ${item.author_name} ${item.category} ${item.short_description}`.toLowerCase().includes(search.toLowerCase());
    const isPublished = item.isPublished === true || item.isPublished === 1 || item.isPublished === "1";
    return matchesSearch && (status === "all" || (status === "published" ? isPublished : !isPublished));
  }).map(mapBlog), [items, search, status]);
  const metrics = useMemo(() => ({ total: items.length, published: items.filter((item) => item.isPublished === true || item.isPublished === 1 || item.isPublished === "1").length, drafts: items.filter((item) => !(item.isPublished === true || item.isPublished === 1 || item.isPublished === "1")).length, views: items.reduce((total, item) => total + (Number(item.view_count) || 0), 0) }), [items]);
  const save = async (values: BlogFormValues, id?: string | number) => {
    if (id) await updateBlog(id, values); else await createBlog(values);
    toast.success(id ? "Blog post updated successfully." : "Blog post created successfully.");
    await refresh();
  };
  const remove = async (id: string | number) => {
    await deleteBlog(id);
    toast.success("Blog post deleted successfully.");
    await refresh();
  };
  return { rows, metrics, search, setSearch, status, setStatus, isLoading, refresh, save, remove, getBlog };
}
