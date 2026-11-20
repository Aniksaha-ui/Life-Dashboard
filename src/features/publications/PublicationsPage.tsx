import type { ColumnDef } from "@tanstack/react-table";
import {
  ExternalLink,
  Eye,
  FileText,
  Pencil,
  Plus,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { DataTable } from "../../components/DataTable";
import { EmptyState } from "../../components/EmptyState";
import { Modal } from "../../components/Modal";
import { outlinedControlClass, OutlinedField } from "../../components/OutlinedField";
import { SearchField } from "../../components/SearchField";
import {
  createPublication,
  deletePublication,
  listPublications,
  updatePublication,
} from "./api";
import type { Publication, PublicationValues } from "./types";

const blank: PublicationValues = {
  title: "",
  abstract: "",
  authors: "",
  publication_date: "",
  publisher: "",
  doi: "",
  url: "",
  pdf_url: "",
  status: 1,
};
const externalUrl = (value: string) =>
  /^https?:\/\//i.test(value.trim()) ? value.trim() : `https://${value.trim()}`;

function PublicationForm({
  publication,
  onClose,
  onSave,
}: {
  publication: Publication | null;
  onClose: () => void;
  onSave: (values: PublicationValues, id?: string | number) => Promise<void>;
}) {
  const [values, setValues] = useState<PublicationValues>(
    publication
      ? {
          title: publication.title,
          abstract: publication.abstract,
          authors: publication.authors,
          publication_date: publication.publication_date,
          publisher: publication.publisher,
          doi: publication.doi,
          url: publication.url,
          pdf_url: publication.pdf_url,
          status: publication.status,
        }
      : blank,
  );
  const [saving, setSaving] = useState(false);
  const field = (
    key: keyof PublicationValues,
    label: string,
    type = "text",
  ) => (
    <OutlinedField label={label}>
      <input
        required
        type={type}
        value={String(values[key])}
        onChange={(event) =>
          setValues({ ...values, [key]: event.target.value })
        }
        className={outlinedControlClass}
      />
    </OutlinedField>
  );
  return (
    <Modal
      isOpen
      onClose={onClose}
      title={publication ? "Edit publication" : "Add publication"}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600"
          >
            Cancel
          </button>
          <button
            form="publication-form"
            disabled={saving}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save publication"}
          </button>
        </>
      }
    >
      <form
        id="publication-form"
        onSubmit={async (event) => {
          event.preventDefault();
          setSaving(true);
          try {
            await onSave(values, publication?.id);
            onClose();
          } finally {
            setSaving(false);
          }
        }}
        className="grid max-h-[65vh] items-center gap-4 overflow-y-auto pr-1 sm:grid-cols-2"
      >
        <OutlinedField label="Title" className="sm:col-span-2">
          <input
            required
            value={values.title}
            onChange={(event) =>
              setValues({ ...values, title: event.target.value })
            }
            className={outlinedControlClass}
          />
        </OutlinedField>
        {field("authors", "Author(s)")}
        {field("publication_date", "Publication date", "date")}
        {field("publisher", "Publisher")}
        {field("doi", "DOI")}
        {field("url", "Publication URL", "url")}
        <OutlinedField label="PDF URL">
          <input
            required
            type="url"
            value={values.pdf_url}
            onChange={(event) =>
              setValues({ ...values, pdf_url: event.target.value })
            }
            className={outlinedControlClass}
          />
        </OutlinedField>
        <OutlinedField label="Abstract" className="sm:col-span-2">
          <textarea
            required
            value={values.abstract}
            onChange={(event) =>
              setValues({ ...values, abstract: event.target.value })
            }
            className="min-h-20 w-full resize-y border-0 bg-transparent p-0 text-sm text-slate-800 outline-none focus:bg-transparent focus:shadow-none"
          />
        </OutlinedField>
        <label className="flex h-10 items-center gap-3 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 sm:col-span-2">
          <input
            type="checkbox"
            checked={values.status === 1}
            onChange={(event) =>
              setValues({ ...values, status: event.target.checked ? 1 : 0 })
            }
          />
          Show this publication
        </label>
      </form>
    </Modal>
  );
}

function PublicationDetails({
  publication,
  onClose,
}: {
  publication: Publication;
  onClose: () => void;
}) {
  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Publication details"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Close
        </button>
      }
    >
      <div className="space-y-4 text-sm">
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            {publication.title}
          </h3>
          <p className="mt-1 text-slate-500">{publication.authors}</p>
        </div>
        <p className="whitespace-pre-line leading-6 text-slate-700">
          {publication.abstract}
        </p>
        <dl className="grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-bold uppercase text-slate-500">
              Publisher
            </dt>
            <dd className="mt-1 text-slate-800">{publication.publisher}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase text-slate-500">
              Published
            </dt>
            <dd className="mt-1 text-slate-800">
              {publication.publication_date}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-bold uppercase text-slate-500">DOI</dt>
            <dd className="mt-1 text-slate-800">{publication.doi}</dd>
          </div>
        </dl>
        <div className="flex flex-wrap gap-2">
          <a
            href={externalUrl(publication.url)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-primary-200 px-3 py-2 font-semibold text-primary-700 hover:bg-primary-50"
          >
            <ExternalLink className="h-4 w-4" />
            Publication link
          </a>
          <a
            href={externalUrl(publication.pdf_url)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50"
          >
            <FileText className="h-4 w-4" />
            Open PDF
          </a>
        </div>
      </div>
    </Modal>
  );
}

export default function PublicationsPage() {
  const [items, setItems] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Publication | null | undefined>(
    undefined,
  );
  const [detail, setDetail] = useState<Publication | null>(null);
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listPublications());
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load publications.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  const rows = useMemo(
    () =>
      items.filter((item) =>
        `${item.title} ${item.authors} ${item.publisher} ${item.doi}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [items, search],
  );
  const save = async (values: PublicationValues, id?: string | number) => {
    try {
      id
        ? await updatePublication(id, values)
        : await createPublication(values);
      toast.success(
        id
          ? "Publication updated successfully."
          : "Publication created successfully.",
      );
      await refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save publication.",
      );
      throw error;
    }
  };
  const remove = async (publication: Publication) => {
    if (!window.confirm(`Delete ${publication.title}? This cannot be undone.`))
      return;
    try {
      await deletePublication(publication.id);
      toast.success("Publication deleted successfully.");
      await refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete publication.",
      );
    }
  };
  const columns = useMemo<ColumnDef<Publication>[]>(
    () => [
      {
        id: "publication",
        header: "Publication",
        cell: ({ row }) => (
          <div className="min-w-52">
            <p className="font-semibold text-slate-900">{row.original.title}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {row.original.authors}
            </p>
          </div>
        ),
      },
      { accessorKey: "publisher", header: "Publisher" },
      { accessorKey: "publication_date", header: "Date" },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.original.status === 1 ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
          >
            {row.original.status === 1 ? "Visible" : "Hidden"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <button
              type="button"
              onClick={() => setDetail(row.original)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
              aria-label={`View ${row.original.title}`}
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setEditing(row.original)}
              className="rounded-lg p-2 text-primary-600 hover:bg-primary-50"
              aria-label={`Edit ${row.original.title}`}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => void remove(row.original)}
              className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
              aria-label={`Delete ${row.original.title}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
        meta: { headerClassName: "text-right" },
      },
    ],
    [],
  );
  return (
    <div className="app-management-page publications-page space-y-6">
      <div className="app-page-header flex flex-col gap-4 sm:flex-row sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Publications</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage research publications, citations, and reader links.
          </p>
        </div>
        <div className="app-page-actions flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setEditing(null)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            Add publication
          </button>
        </div>
      </div>
      <section className="app-filter-panel rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-2 items-center gap-3 lg:grid-cols-[minmax(0,18rem)_auto_auto] lg:justify-start">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search publications"
            className="col-span-2 lg:col-span-1"
          />
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 px-3 text-slate-600 disabled:opacity-60"
            aria-label="Refresh publications"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            type="button"
            onClick={() => setSearch("")}
            className="h-10 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Clear filters
          </button>
        </div>
      </section>
      {!loading && !rows.length ? (
        <div className="rounded-xl border border-slate-200 bg-white">
          <EmptyState
            title="No publications found"
            subtitle="Try another search or add your first publication."
          />
        </div>
      ) : (
        <DataTable
          data={rows}
          columns={columns}
          isLoading={loading}
          loadingText="Loading publications..."
          hideToolbarDateFilter
          hideViewColumn
          mobileCard
          mobileCardTitleColumn={0}
          mobileCardHideFirstColumn
          className="compact-mobile-table border-slate-200"
        />
      )}
      {editing !== undefined && (
        <PublicationForm
          publication={editing}
          onClose={() => setEditing(undefined)}
          onSave={save}
        />
      )}
      {detail && (
        <PublicationDetails
          publication={detail}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  );
}
