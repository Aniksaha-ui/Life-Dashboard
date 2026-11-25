import type { ColumnDef } from "@tanstack/react-table";
import {
  Code2,
  ExternalLink,
  Github,
  Pencil,
  Plus,
  RefreshCcw,
  Trash2,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { DataTable } from "../../components/DataTable";
import { EmptyState } from "../../components/EmptyState";
import { MobileRecordDrawer } from "../../components/MobileRecordDrawer";
import { Modal } from "../../components/Modal";
import { OutlinedField } from "../../components/OutlinedField";
import { SearchField } from "../../components/SearchField";
import {
  createProject,
  deleteProject,
  listProjects,
  updateProject,
} from "./api";
import type { Project, ProjectValues } from "./types";

const blank: ProjectValues = {
  project_name: "",
  description: "",
  website_link: "",
  frontend_tech: "",
  backend_tech: "",
  database: "",
  github_link: "",
  image: "",
  no_of_developers: 1,
  developers_name: "",
  start_date: "",
  end_date: "",
  published_at: "",
  isPublished: false,
};
const published = (value: Project["isPublished"]) =>
  value === true || value === 1 || value === "1";
const externalUrl = (value: string) =>
  /^https?:\/\//i.test(value.trim()) ? value.trim() : `https://${value.trim()}`;

function ProjectForm({
  project,
  onClose,
  onSave,
}: {
  project: Project | null;
  onClose: () => void;
  onSave: (values: ProjectValues, id?: string | number) => Promise<void>;
}) {
  const [values, setValues] = useState<ProjectValues>(
    project
      ? { ...project, isPublished: published(project.isPublished) }
      : blank,
  );
  const [saving, setSaving] = useState(false);
  const field = (
    key: keyof ProjectValues,
    label: string,
    type = "text",
    optional = false,
  ) => (
    <OutlinedField label={label}>
      <input
        required={!optional}
        type={type}
        value={String(values[key] ?? "")}
        onChange={(event) =>
          setValues({
            ...values,
            [key]:
              type === "number"
                ? Number(event.target.value)
                : event.target.value,
          })
        }
        className="h-8 w-full border-0 bg-transparent p-0 text-sm outline-none focus:bg-transparent focus:shadow-none"
      />
    </OutlinedField>
  );
  return (
    <Modal
      isOpen
      onClose={onClose}
      title={project ? "Edit project" : "Add project"}
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
            form="project-form"
            disabled={saving}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save project"}
          </button>
        </>
      }
    >
      <form
        id="project-form"
        onSubmit={async (event) => {
          event.preventDefault();
          setSaving(true);
          try {
            await onSave(values, project?.id);
            onClose();
          } finally {
            setSaving(false);
          }
        }}
        className="space-y-5"
      >
        <div className="grid items-start gap-x-4 gap-y-5 sm:grid-cols-2">
          {field("project_name", "Project name")}
          {field("website_link", "Website URL")}
          {field("github_link", "GitHub URL")}
          {field("image", "Image URL", "text", true)}
          {field("frontend_tech", "Frontend technology")}
          {field("backend_tech", "Backend technology")}
          {field("database", "Database")}
          {field("no_of_developers", "Developers", "number")}
          {field("developers_name", "Developer names")}
          {field("start_date", "Start date", "date", true)}
          {field("end_date", "End date", "date", true)}
          {field("published_at", "Published date", "date", true)}
        </div>
        <OutlinedField label="Description">
          <textarea
            required
            value={values.description}
            onChange={(event) =>
              setValues({ ...values, description: event.target.value })
            }
            className="min-h-24 w-full resize-y border-0 bg-transparent p-0 text-sm outline-none focus:bg-transparent focus:shadow-none"
          />
        </OutlinedField>
        <label className="flex h-10 items-center gap-3 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={values.isPublished}
            onChange={(event) =>
              setValues({ ...values, isPublished: event.target.checked })
            }
          />
          Publish this project
        </label>
      </form>
    </Modal>
  );
}

export default function ProjectsPage() {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Project | null | undefined>(
    undefined,
  );
  const [viewing, setViewing] = useState<Project | null>(null);
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listProjects());
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load projects.",
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
        `${item.project_name} ${item.description} ${item.frontend_tech} ${item.backend_tech}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [items, search],
  );
  const save = async (values: ProjectValues, id?: string | number) => {
    try {
      id ? await updateProject(id, values) : await createProject(values);
      toast.success(
        id ? "Project updated successfully." : "Project created successfully.",
      );
      await refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save project.",
      );
      throw error;
    }
  };
  const remove = async (project: Project) => {
    if (
      !window.confirm(`Delete ${project.project_name}? This cannot be undone.`)
    )
      return;
    try {
      await deleteProject(project.id);
      toast.success("Project deleted successfully.");
      await refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete project.",
      );
    }
  };
  const columns = useMemo<ColumnDef<Project>[]>(
    () => [
      {
        id: "project",
        header: "Project",
        cell: ({ row }) => (
          <div className="flex min-w-48 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-primary-50 text-primary-700">
              {row.original.image ? (
                <img
                  src={row.original.image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <Code2 className="h-5 w-5" />
              )}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">
                {row.original.project_name}
              </p>
              <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                {row.original.description}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "technology",
        header: "Technology",
        cell: ({ row }) => (
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-800">
              {row.original.frontend_tech}
            </p>
            <p className="text-xs text-slate-500">
              {row.original.backend_tech} · {row.original.database}
            </p>
          </div>
        ),
      },
      {
        id: "team",
        header: "Team",
        cell: ({ row }) => (
          <div>
            <p className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-800">
              <Users className="h-3.5 w-3.5 text-primary-600" />
              {row.original.no_of_developers} developers
            </p>
            <p className="mt-1 max-w-40 truncate text-xs text-slate-500">
              {row.original.developers_name}
            </p>
          </div>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${published(row.original.isPublished) ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
          >
            {published(row.original.isPublished) ? "Published" : "Draft"}
          </span>
        ),
      },
      {
        id: "links",
        header: "Links",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <a
              href={externalUrl(row.original.website_link)}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg p-2 text-primary-600 hover:bg-primary-50"
              aria-label="Open website"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
            <a
              href={externalUrl(row.original.github_link)}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
              aria-label="Open GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setSelected(row.original);
              }}
              className="rounded-lg p-2 text-primary-600 hover:bg-primary-50"
              aria-label={`Edit ${row.original.project_name}`}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                void remove(row.original);
              }}
              className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
              aria-label={`Delete ${row.original.project_name}`}
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
    <div className="app-management-page projects-page space-y-6">
      <header className="app-page-header flex flex-col gap-4 sm:flex-row sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your portfolio projects, technology, links, and publishing
            status.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSelected(null)}
          className="app-page-primary-action inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          Add project
        </button>
      </header>
      <section className="app-filter-panel flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Search projects"
          className="min-w-0 w-full sm:w-80"
        />
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </section>
      {!loading && !rows.length ? (
        <div className="rounded-xl border border-slate-200 bg-white">
          <EmptyState
            title="No projects found"
            subtitle="Try another search or add your first project."
          />
        </div>
      ) : (
        <DataTable
          data={rows}
          columns={columns}
          isLoading={loading}
          loadingText="Loading projects..."
          hideToolbarDateFilter
          hideViewColumn
          mobileCard
          mobileCardTitleColumn={0}
          mobileCardHideFirstColumn
          className="compact-mobile-table border-slate-200"
          onRowClick={setViewing}
        />
      )}
      <MobileRecordDrawer
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={viewing?.project_name || "Project Details"}
        badge={
          viewing
            ? viewing.isPublished === true ||
              viewing.isPublished === 1 ||
              viewing.isPublished === "1"
              ? "Published"
              : "Draft"
            : undefined
        }
        badgeClassName={
          viewing &&
          (viewing.isPublished === true ||
            viewing.isPublished === 1 ||
            viewing.isPublished === "1")
            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
            : "bg-amber-50 text-amber-700 ring-amber-200"
        }
        recordId={viewing ? `PRJ #${viewing.id}` : undefined}
        headerAction={
          viewing ? (
            <button
              type="button"
              onClick={() => {
                const target = viewing;
                setViewing(null);
                setSelected(target);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
          ) : undefined
        }
        hero={
          viewing
            ? {
                icon: Code2,
                iconClassName: "bg-primary-50 text-primary-600",
                overline: "Portfolio project",
                value: viewing.project_name,
                meta: [viewing.frontend_tech, viewing.backend_tech]
                  .filter(Boolean)
                  .join(" · "),
                coverImage: viewing.image ? (
                  <img
                    src={viewing.image}
                    alt=""
                    className="h-48 w-full border-b border-slate-100 object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : undefined,
                stats: [
                  {
                    label: "Team size",
                    value: `${viewing.no_of_developers || 1} developer${Number(viewing.no_of_developers || 1) === 1 ? "" : "s"}`,
                  },
                  {
                    label: "Database",
                    value: viewing.database,
                    valueClassName: "text-primary-700",
                  },
                ],
              }
            : undefined
        }
        details={
          viewing
            ? [
                { label: "Frontend Tech", value: viewing.frontend_tech },
                { label: "Backend Tech", value: viewing.backend_tech },
                { label: "Database", value: viewing.database },
                {
                  label: "Developers",
                  value: viewing.developers_name || viewing.no_of_developers,
                },
                { label: "Start Date", value: viewing.start_date },
                { label: "End Date", value: viewing.end_date || "Present" },
                {
                  label: "Description",
                  value: viewing.description ? (
                    <span className="whitespace-pre-line leading-6 text-slate-700">
                      {viewing.description}
                    </span>
                  ) : (
                    "No description provided."
                  ),
                  fullWidth: true,
                },
              ]
            : []
        }
        sections={
          viewing && (viewing.website_link || viewing.github_link)
            ? [
                {
                  title: "Links & Repositories",
                  content: (
                    <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      {viewing.website_link && (
                        <a
                          href={viewing.website_link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg border border-primary-200 px-3.5 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Live Website
                        </a>
                      )}
                      {viewing.github_link && (
                        <a
                          href={viewing.github_link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Github className="h-4 w-4" />
                          GitHub Repo
                        </a>
                      )}
                    </div>
                  ),
                },
              ]
            : []
        }
      />
      {selected !== undefined && (
        <ProjectForm
          project={selected}
          onClose={() => setSelected(undefined)}
          onSave={save}
        />
      )}
    </div>
  );
}
