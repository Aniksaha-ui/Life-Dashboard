import {
  ChevronRight,
  Download,
  Eye,
  File,
  FileImage,
  FileText,
  Folder,
  FolderPlus,
  MoreVertical,
  Pencil,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { Loader } from "../../components/Loader";
import {
  createFolder,
  deleteItem,
  downloadFile,
  getItems,
  renameItem,
  uploadFiles,
  uploadFileVersion,
} from "./api/queries";
import { DocumentPreviewDrawer } from "./components/DocumentPreviewDrawer";

const size = (bytes = 0) =>
  bytes
    ? `${(bytes / (bytes >= 1048576 ? 1048576 : 1024)).toFixed(1)} ${bytes >= 1048576 ? "MB" : "KB"}`
    : "0 B";
const icon = (mime = "") =>
  mime.startsWith("image/")
    ? FileImage
    : mime.includes("pdf")
      ? FileText
      : File;
const fileKind = (file: any) => {
  const name = String(file.original_name || file.name || "").toLowerCase();
  if (/\.(xlsx|xls|xlsm|xlsb|ods)$/.test(name)) return "Excel workbook";
  if (/\.csv$/.test(name)) return "CSV document";
  if (/\.pdf$/.test(name)) return "PDF document";
  if (file.mime_type?.startsWith("image/")) return "Image";
  if (/\.(txt|md|json|xml|html|css|js)$/.test(name)) return "Text document";
  return "Document";
};

export default function FileManagerPage() {
  const input = useRef<HTMLInputElement>(null);
  const versionInput = useRef<HTMLInputElement>(null);
  const [folderId, setFolderId] = useState<string | number | null>(null);
  const [items, setItems] = useState<any>({
    folders: [],
    files: [],
    breadcrumbs: [],
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dialog, setDialog] = useState<{
    action: "create" | "rename" | "delete";
    kind: "files" | "folders";
    item?: any;
  } | null>(null);
  const [name, setName] = useState("");
  const [previewFile, setPreviewFile] = useState<any>(null);
  const [versionTarget, setVersionTarget] = useState<any>(null);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await getItems(folderId));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to load files.");
    } finally {
      setLoading(false);
    }
  }, [folderId]);
  useEffect(() => {
    void load();
  }, [load]);
  const upload = async (list: FileList | null) => {
    const files = Array.from(list ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      await uploadFiles(files, folderId);
      toast.success(
        `${files.length} file${files.length > 1 ? "s" : ""} uploaded.`,
      );
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!dialog) return;
    try {
      if (dialog.action === "create") await createFolder(name.trim(), folderId);
      if (dialog.action === "rename")
        await renameItem(dialog.kind, dialog.item.id, name.trim());
      if (dialog.action === "delete")
        await deleteItem(dialog.kind, dialog.item.id);
      toast.success(
        dialog.action === "delete" ? "Item deleted." : "Changes saved.",
      );
      setDialog(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed.");
    }
  };
  const openDialog = (
    action: "create" | "rename" | "delete",
    kind: "files" | "folders",
    item?: any,
  ) => {
    setName(item?.name || item?.original_name || "");
    setDialog({ action, kind, item });
  };
  const all = [...(items.folders ?? []), ...(items.files ?? [])];
  const uploadVersion = async (list: FileList | null) => {
    const file = list?.[0];
    if (!file || !versionTarget) return;
    setUploading(true);
    try { await uploadFileVersion(versionTarget.id, file); toast.success("New version uploaded."); await load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Version upload failed."); }
    finally { setUploading(false); setVersionTarget(null); }
  };
  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 via-white to-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary-700">
            Private storage
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            File Manager
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Organize your documents, receipts, images, and notes.
          </p>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
          <button
            onClick={() => openDialog("create", "folders")}
            className="inline-flex min-w-0 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <FolderPlus className="h-4 w-4" />
            New folder
          </button>
          <button
            onClick={() => input.current?.click()}
            className="inline-flex min-w-0 items-center justify-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
            disabled={uploading}
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading…" : "Upload files"}
          </button>
          <input
            ref={input}
            className="hidden"
            type="file"
            multiple
            onChange={(e) => {
              void upload(e.target.files);
              e.currentTarget.value = "";
            }}
          />
          <input ref={versionInput} className="hidden" type="file" onChange={(e) => { void uploadVersion(e.target.files); e.currentTarget.value = ""; }} />
        </div>
      </header>
      <nav className="flex min-w-0 items-center gap-1 overflow-x-auto pb-1 text-sm [scrollbar-width:none]">
        <button
          onClick={() => setFolderId(null)}
          className="whitespace-nowrap font-semibold text-primary-600"
        >
          My files
        </button>
        {(items.breadcrumbs ?? []).map((crumb: any) => (
          <span key={crumb.id} className="flex min-w-0 items-center gap-1">
            <ChevronRight className="h-4 w-4 text-slate-400" />
            <button
              onClick={() => setFolderId(crumb.id)}
              className="max-w-28 truncate whitespace-nowrap text-slate-600 hover:text-primary-600 sm:max-w-none"
            >
              {crumb.name}
            </button>
          </span>
        ))}
      </nav>
      <section
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void upload(e.dataTransfer.files);
        }}
        className={`flex min-h-40 flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center transition sm:p-7 ${dragging ? "border-primary-500 bg-primary-50" : "border-slate-200 bg-white"}`}
      >
        <Upload className="h-6 w-6 text-primary-600" />
        <p className="mt-2 text-sm font-semibold text-slate-700">
          Drop files here, or{" "}
          <button
            onClick={() => input.current?.click()}
            className="text-primary-600"
          >
            browse
          </button>
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Upload to {items.folder?.name || "My files"}
        </p>
      </section>
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader size="lg" />
        </div>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4 text-sm font-semibold text-slate-700">
            {all.length
              ? `${items.folders?.length || 0} folders · ${items.files?.length || 0} files`
              : "This folder is empty"}
          </div>
          <div className="p-4">
            {items.folders?.length ? (
              <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.folders.map((folder: any) => (
                  <article
                    key={folder.id}
                      className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <button
                      onClick={() => setFolderId(folder.id)}
                      className="flex min-w-0 items-center gap-3 text-left"
                    >
                      <Folder className="h-7 w-7 shrink-0 fill-amber-400 text-amber-400" />
                      <span className="truncate font-semibold text-slate-800">
                        {folder.name}
                      </span>
                    </button>
                    <Menu
                      onRename={() => openDialog("rename", "folders", folder)}
                      onDelete={() => openDialog("delete", "folders", folder)}
                    />
                  </article>
                ))}
              </div>
            ) : null}
            {items.files?.length ? (
              <div className="space-y-2">
                {items.files.map((file: any) => {
                  const Icon = icon(file.mime_type);
                  return (
                    <article
                      key={file.id}
                      className="flex flex-wrap items-start gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm transition hover:border-primary-100 hover:bg-primary-50/30 sm:items-center sm:flex-nowrap"
                    >
                      <Icon className="h-6 w-6 shrink-0 text-primary-600 sm:h-5 sm:w-5" />
                      <div className="min-w-0 flex-[1_1_12rem]">
                        <p className="truncate text-[15px] font-semibold text-slate-800 sm:text-sm">
                          {file.original_name || file.name}
                        </p>
                        <p className="mt-1 truncate text-sm text-slate-500 sm:mt-0.5 sm:text-xs">
                          {fileKind(file)} · {size(file.size)}
                        </p>
                      </div>
                      <div className="flex w-full items-center justify-end gap-1 border-t border-slate-100 pt-2 sm:w-auto sm:border-0 sm:pt-0">
                        <span className="mr-auto text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:hidden">File actions</span>
                        <button aria-label={`Preview ${file.original_name || file.name}`} onClick={() => setPreviewFile(file)} className="grid h-10 w-10 place-items-center rounded-lg text-slate-500 hover:bg-primary-50 hover:text-primary-600 sm:h-8 sm:w-8" title="Preview file"><Eye className="h-5 w-5 sm:h-4 sm:w-4" /></button>
                        <button aria-label={`Upload new version of ${file.original_name || file.name}`} onClick={() => { setVersionTarget(file); versionInput.current?.click(); }} className="grid h-10 w-10 place-items-center rounded-lg text-slate-500 hover:bg-primary-50 hover:text-primary-600 sm:h-8 sm:w-8" title="Upload new version"><Upload className="h-5 w-5 sm:h-4 sm:w-4" /></button>
                        <button
                          onClick={() =>
                            void downloadFile(file.id).catch((e) =>
                              toast.error(e.message),
                            )
                          }
                          aria-label={`Download ${file.original_name || file.name}`}
                          className="grid h-10 w-10 place-items-center rounded-lg text-slate-500 hover:bg-primary-50 hover:text-primary-600 sm:h-8 sm:w-8"
                        >
                          <Download className="h-5 w-5 sm:h-4 sm:w-4" />
                        </button>
                        <Menu
                          onRename={() => openDialog("rename", "files", file)}
                          onDelete={() => openDialog("delete", "files", file)}
                        />
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : null}
            {!all.length && (
              <div className="py-16 text-center">
                <Folder className="mx-auto h-9 w-9 text-slate-300" />
                <p className="mt-3 text-sm text-slate-500">
                  Create a folder or upload files to get started.
                </p>
              </div>
            )}
          </div>
        </section>
      )}
      {dialog && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
          <form
            onSubmit={submit}
            className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="font-bold text-slate-900">
                  {dialog.action === "create"
                    ? "Create folder"
                    : dialog.action === "rename"
                      ? "Rename item"
                      : "Delete item"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {dialog.action === "delete"
                    ? `Delete “${name}”? This cannot be undone.`
                    : "Enter a clear, descriptive name."}
                </p>
              </div>
              <button type="button" onClick={() => setDialog(null)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            {dialog.action !== "delete" && (
              <div className="p-5">
                <input
                  autoFocus
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                  placeholder="Name"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 border-t border-slate-100 p-4 sm:flex sm:justify-end">
              <button
                type="button"
                onClick={() => setDialog(null)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 sm:min-w-24"
              >
                Cancel
              </button>
              <button
                className={`rounded-lg px-3 py-2 text-sm font-semibold text-white sm:min-w-24 ${dialog.action === "delete" ? "bg-rose-600" : "bg-primary-600"}`}
              >
                {dialog.action === "delete" ? "Delete" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
      <DocumentPreviewDrawer file={previewFile} onClose={() => setPreviewFile(null)} onUpdated={() => void load()} />
    </div>
  );
}

function Menu({
  onRename,
  onDelete,
}: {
  onRename: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-1 w-32 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          <button
            onClick={onRename}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Rename
          </button>
          <button
            onClick={onDelete}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
