import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { createBlog, deleteBlog, getBlog, getBlogs, updateBlog, type BlogCollection } from "../api/queries";
import type { BlogApiItem, BlogFormValues } from "../types";
import { mapBlog } from "../utils/blogMapper";

export function useBlogs() {
  const [items, setItems] = useState<BlogApiItem[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<BlogCollection["pagination"]>({ currentPage: 1, lastPage: 1, total: 0, from: 0, to: 0 });
  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getBlogs(pagination.currentPage, search);
      setItems(response.rows);
      setPagination(response.pagination);
    }
    catch (error) { toast.error(error instanceof Error ? error.message : "Unable to load blog posts."); }
    finally { setIsLoading(false); }
  }, [pagination.currentPage, search]);
  useEffect(() => { void refresh(); }, [refresh]);
  const rows = useMemo(() => items.filter((item) => {
    const matchesSearch = `${item.title} ${item.author_name} ${item.category} ${item.short_description}`.toLowerCase().includes(search.toLowerCase());
    const isPublished = item.isPublished === true || item.isPublished === 1 || item.isPublished === "1";
    return matchesSearch && (status === "all" || (status === "published" ? isPublished : !isPublished));
  }).map((item, index) => mapBlog(item, pagination.from + index - 1)), [items, search, status, pagination.from]);
  const metrics = useMemo(() => ({ total: pagination.total, published: items.filter((item) => item.isPublished === true || item.isPublished === 1 || item.isPublished === "1").length, drafts: items.filter((item) => !(item.isPublished === true || item.isPublished === 1 || item.isPublished === "1")).length, views: items.reduce((total, item) => total + (Number(item.view_count) || 0), 0) }), [items, pagination.total]);
  const save = async (values: BlogFormValues, id?: string | number) => {
    if (id) await updateBlog(id, values); else await createBlog(values);
    toast.success(id ? "Blog post updated successfully." : "Blog post created successfully.");
    await refresh();
  };
  const remove = async (id: string | number) => {
    await deleteBlog(id);
    toast.success("Blog post deleted successfully.");
    if (items.length === 1 && pagination.currentPage > 1) {
      setPagination((current) => ({ ...current, currentPage: current.currentPage - 1 }));
    } else {
      await refresh();
    }
  };
  const changeSearch = (value: string) => { setSearch(value); setPagination((current) => ({ ...current, currentPage: 1 })); };
  const changeStatus = (value: "all" | "published" | "draft") => { setStatus(value); setPagination((current) => ({ ...current, currentPage: 1 })); };
  const setPage = (currentPage: number) => setPagination((current) => ({ ...current, currentPage: Math.min(Math.max(1, currentPage), current.lastPage) }));
  return { rows, metrics, search, setSearch: changeSearch, status, setStatus: changeStatus, isLoading, refresh, save, remove, getBlog, pagination, setPage };
}
