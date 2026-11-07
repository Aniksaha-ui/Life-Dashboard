import { Download, Pencil, Save } from "lucide-react";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Drawer } from "../../../components/Drawer";
import { Loader } from "../../../components/Loader";
import {
  downloadFile,
  getFilePreview,
  getTextContent,
  saveTextContent,
  uploadFileVersion,
} from "../api/queries";

const filename = (file: any) => file?.original_name || file?.name || "";
const isText = (file: any) =>
  file?.mime_type?.startsWith("text/") ||
  /\.(txt|md|csv|json|xml|html|css|js)$/i.test(filename(file));
const isWorkbook = (file: any) =>
  /\.(xlsx|xls|xlsm|xlsb|ods)$/i.test(filename(file));

export function DocumentPreviewDrawer({
  file,
  onClose,
  onUpdated,
}: {
  file: any;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const text = isText(file);
  const workbook = isWorkbook(file);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [mime, setMime] = useState("");
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [sheets, setSheets] = useState<Record<string, unknown[][]>>({});
  const [sheetName, setSheetName] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!file) return;
    let objectUrl = "";
    setLoading(true);
    setError("");
    setEditing(false);
    setSheets({});
    setSheetName("");
    const load = async () => {
      if (text) {
        const data = await getTextContent(file.id);
        setContent(data.content || "");
        return;
      }
      const preview = await getFilePreview(file.id);
      objectUrl = preview.url;
      setUrl(preview.url);
      setMime(preview.mime);
      if (workbook) {
        const buffer = await fetch(preview.url).then((response) =>
          response.arrayBuffer(),
        );
        const book = XLSX.read(buffer, { type: "array" });
        const parsed = Object.fromEntries(
          book.SheetNames.map((name) => [
            name,
            XLSX.utils.sheet_to_json(book.Sheets[name], {
              header: 1,
              defval: "",
            }) as unknown[][],
          ]),
        );
        setSheets(parsed);
        setSheetName(book.SheetNames[0] || "");
      }
    };
    void load()
      .catch((reason) =>
        setError(
          reason instanceof Error ? reason.message : "Preview unavailable.",
        ),
      )
      .finally(() => setLoading(false));
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file, text, workbook]);
  const save = async () => {
    setSaving(true);
    try {
      if (text) {
        await saveTextContent(file.id, content);
      } else {
        const book = XLSX.utils.book_new();
        Object.entries(sheets).forEach(([name, values]) =>
          XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(values), name),
        );
        const extension = filename(file).split(".").pop()?.toLowerCase();
        const bookType = extension === "xls" ? "xls" : extension === "ods" ? "ods" : "xlsx";
        const output = XLSX.write(book, { bookType, type: "array" });
        await uploadFileVersion(file.id, new File([output], filename(file), { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
      }
      setEditing(false);
      onUpdated();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save this document.");
    } finally {
      setSaving(false);
    }
  };
  const updateCell = (rowIndex: number, cellIndex: number, value: string) => setSheets((current) => ({ ...current, [sheetName]: (current[sheetName] ?? []).map((row, index) => index === rowIndex ? row.map((cell, column) => column === cellIndex ? value : cell) : row) }));
  const rows = sheets[sheetName] ?? [];
  return (
    <Drawer
      open={Boolean(file)}
      onClose={onClose}
      width="4xl"
      title={
        <span className="block max-w-[11rem] truncate sm:max-w-md">
          {filename(file)}
        </span>
      }
      subtitle={
        text
          ? "Editable text document"
          : workbook
            ? "Excel workbook preview"
            : "Document preview"
      }
      headerAction={
        <>
          {(text || workbook) && (
            <button
              onClick={() => (editing ? void save() : setEditing(true))}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-2.5 py-2 text-sm font-semibold text-white sm:px-3"
            >
              {editing ? (
                <Save className="h-4 w-4" />
              ) : (
                <Pencil className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {saving ? "Saving…" : editing ? "Save version" : "Edit"}
              </span>
            </button>
          )}
          <button
            onClick={() => void downloadFile(file.id)}
            className="rounded-lg border border-slate-200 p-2 text-slate-600"
          >
            <Download className="h-4 w-4" />
          </button>
        </>
      }
    >
      <div className="h-[calc(100dvh-8.5rem)] p-3 sm:h-[calc(100dvh-10rem)] sm:p-6">
        {loading ? (
          <div className="grid h-full place-items-center">
            <Loader size="lg" />
          </div>
        ) : error ? (
          <div className="grid h-full place-items-center text-center">
            <p className="text-sm text-slate-500">
              {error}
              <br />
              Download this document to view it in its native application.
            </p>
          </div>
        ) : text ? (
          editing ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="h-full w-full rounded-xl border border-slate-300 bg-slate-950 p-3 font-mono text-xs text-white outline-none focus:ring-4 focus:ring-primary-100 sm:p-4 sm:text-sm"
            />
          ) : (
            <pre className="h-full overflow-auto whitespace-pre-wrap rounded-xl bg-slate-950 p-3 font-mono text-xs text-slate-100 sm:p-4 sm:text-sm">
              {content}
            </pre>
          )
        ) : workbook ? (
          <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 p-3">
              <select
                value={sheetName}
                onChange={(event) => setSheetName(event.target.value)}
                className="h-9 max-w-full rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-700"
              >
                {Object.keys(sheets).map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="min-w-full border-collapse text-left text-xs sm:text-sm">
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={
                        rowIndex === 0
                          ? "bg-slate-50 font-semibold text-slate-700"
                          : "text-slate-600"
                      }
                    >
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="whitespace-nowrap border-b border-r border-slate-100 px-3 py-2"
                        >
                          {editing ? <input value={String(cell ?? "")} onChange={(event) => updateCell(rowIndex, cellIndex, event.target.value)} className="min-w-28 rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-primary-500 sm:text-sm" /> : String(cell ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {!rows.length && (
                <p className="p-8 text-center text-sm text-slate-500">
                  This workbook sheet is empty.
                </p>
              )}
            </div>
          </div>
        ) : mime.startsWith("image/") ? (
          <img
            src={url}
            alt={filename(file)}
            className="h-full w-full object-contain"
          />
        ) : mime.includes("pdf") ? (
          <iframe
            src={url}
            title={filename(file)}
            className="h-full w-full rounded-xl bg-white"
          />
        ) : (
          <div className="grid h-full place-items-center text-center text-sm text-slate-500">
            Preview is not available for this binary document. Download it to
            open it in its native application.
          </div>
        )}
      </div>
    </Drawer>
  );
}
