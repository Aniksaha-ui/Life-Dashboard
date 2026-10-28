import type { ColumnDef } from "@tanstack/react-table";
import { clsx } from "clsx";
import { Download, Plus } from "lucide-react";
import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DataTable } from "../../components/DataTable";
import type { RetailNews } from "./types";

const mockRetailNews: RetailNews[] = [
  {
    id: "1",
    title: "Testing final",
    description:
      "This is a final test description for the retail news article.",
    imageUrl: "https://placehold.co/40x40",
    status: "active",
  },
  {
    id: "2",
    title: "sss",
    description: "Placeholder description for sss article.",
    imageUrl: "https://placehold.co/40x40",
    status: "active",
  },
  {
    id: "3",
    title: "lorem ipsum",
    description: "Standard lorem ipsum dolor sit amet content for testing.",
    imageUrl: "https://placehold.co/40x40",
    status: "active",
  },
  {
    id: "4",
    title: "Lorem ipsum",
    description: "Alternative lorem ipsum description for variety.",
    imageUrl: "https://placehold.co/40x40",
    status: "active",
  },
  {
    id: "5",
    title: "Campaign tests",
    description: "Details about the latest marketing campaign tests.",
    imageUrl: "https://placehold.co/40x40",
    status: "active",
  },
  {
    id: "6",
    title: "indasdkajdska",
    description: "Random string description for edge case testing.",
    imageUrl: "https://placehold.co/40x40",
    status: "inactive",
  },
  {
    id: "7",
    title: "Hello World",
    description: "The classic hello world news article for new systems.",
    imageUrl: "https://placehold.co/40x40",
    status: "active",
  },
  {
    id: "8",
    title: "Testing issue",
    description: "Debugging related news item for internal tracking.",
    imageUrl: "https://placehold.co/40x40",
    status: "active",
  },
  {
    id: "9",
    title: "Retails news test",
    description: "A generic test for the retail news module functionality.",
    imageUrl: "https://placehold.co/40x40",
    status: "active",
  },
  {
    id: "10",
    title: "Testing for QA",
    description: "Specific article created for the quality assurance phase.",
    imageUrl: "https://placehold.co/40x40",
    status: "active",
  },
  {
    id: "11",
    title: "Stored Cross-Site Scripting (XSS) leading to Open Redirect",
    description:
      "Security advisory regarding XSS vulnerabilities and redirects.",
    imageUrl: "https://placehold.co/40x40",
    status: "active",
  },
  {
    id: "12",
    title: "Newsletter Test - 1",
    description:
      "Initial testing phase for the newsletter subscription service.",
    imageUrl: "https://placehold.co/40x40",
    status: "active",
  },
];

export default function RetailNewsPage() {
  const navigate = useNavigate();
  const columns = useMemo<ColumnDef<RetailNews>[]>(
    () => [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => (
          <span className="text-xs text-slate-500">{row.index + 1}</span>
        ),
        size: 50,
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <span className="text-sm font-medium text-slate-700 max-w-[400px] block truncate">
            {row.original.title}
          </span>
        ),
      },
      {
        accessorKey: "imageUrl",
        header: "Image",
        cell: ({ row }) => (
          <div className="w-10 h-10 rounded border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center">
            <img
              src={row.original.imageUrl}
              alt={row.original.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://placehold.co/40x40?text=No+Img";
              }}
            />
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={clsx(
              "text-xs font-medium px-2 py-0.5 rounded-full capitalize",
              row.original.status === "active"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-slate-100 text-slate-500",
            )}
          >
            {row.original.status}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Edit",
        cell: () => (
          <Link
            to="#"
            className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            Edit
          </Link>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Retail News
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage and publish news items for the retail portal.
          </p>
        </div>
        <button
          onClick={() => navigate("/retail-news/add")}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Article
        </button>
      </div>

      <DataTable
        columns={columns}
        data={mockRetailNews}
        hideToolbarDateFilter
        toolbarEndContent={
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors shadow-sm">
            Export
            <Download className="w-4 h-4" />
          </button>
        }
        filterActions={
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900 ml-1">
              Published Articles
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-full border border-slate-200">
              {mockRetailNews.length}
            </span>
          </div>
        }
      />
    </div>
  );
}
