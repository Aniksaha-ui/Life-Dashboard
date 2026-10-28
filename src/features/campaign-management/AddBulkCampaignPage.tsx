import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  ChevronLeft,
  Info,
  Upload,
  FileText,
  Download,
  FileUp,
  AlertCircle,
} from "lucide-react";
import { clsx } from "clsx";
import { getCampaignBannerByIndex } from "./utils/campaignBanners";

const BULK_CAMPAIGN_TEMPLATE_COLUMNS = [
  "Campaign",
  "Sectors",
  "Start Date",
  "End Date",
  "Banner",
  "Enroll Date",
  "Can Onboard",
] as const;

const BULK_CAMPAIGN_TEMPLATE_SAMPLE_ROWS: string[][] = [
  [
    "Karam Leblanc",
    "Agriculture Services, Business Services, Retail Outlet Services",
    "22-Apr-25",
    "22-Apr-25",
    getCampaignBannerByIndex(0),
    "20-Apr-26",
    "No",
  ],
  [
    "test10",
    "Ministry of Foreign Affairs, ITES, Charity/NGO/Volunteer Services, Distance Learning",
    "09-Feb-26",
    "10-Feb-26",
    getCampaignBannerByIndex(1),
    "08-Feb-26",
    "Yes",
  ],
  [
    "test1",
    "ISP, Events Management Services, Ministry of Fisheries and Livestock",
    "09-Feb-26",
    "10-Feb-26",
    getCampaignBannerByIndex(0),
    "25-Jun-25",
    "Yes",
  ],
  [
    "test2",
    "VOD/OTT Platform, Construction Goods",
    "27-Jan-26",
    "27-Jan-26",
    getCampaignBannerByIndex(1),
    "27-Jan-25",
    "Yes",
  ],
];

const isCsvFile = (file: File) => {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return (
    name.endsWith(".csv") ||
    type === "text/csv" ||
    type === "application/vnd.ms-excel"
  );
};

const escapeCsvField = (value: string) => {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const parseCsv = (text: string): { headers: string[]; rows: string[][] } => {
  const parsedRows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const content = text.replace(/^\uFEFF/, "");

  const pushField = () => {
    row.push(field);
    field = "";
  };

  const pushRow = () => {
    if (row.length > 1 || row[0] !== "") {
      parsedRows.push(row);
    }
    row = [];
  };

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const next = content[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      pushField();
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i++;
      pushField();
      pushRow();
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    pushField();
    pushRow();
  }

  if (parsedRows.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = parsedRows[0].map((header) => header.trim());
  const rows = parsedRows
    .slice(1)
    .filter((cells) => cells.some((cell) => cell.trim() !== ""));

  return { headers, rows };
};

const validateBulkCsvHeaders = (headers: string[]) => {
  const expected = [...BULK_CAMPAIGN_TEMPLATE_COLUMNS];
  const normalizedHeaders = headers.map((header) => header.trim());

  if (normalizedHeaders.length !== expected.length) {
    return {
      valid: false,
      message: `Uploaded CSV columns do not match the template. Expected ${expected.length} columns: ${expected.join(", ")}.`,
    };
  }

  const mismatched = expected.filter(
    (column, index) => normalizedHeaders[index] !== column,
  );

  if (mismatched.length > 0) {
    return {
      valid: false,
      message: `Uploaded CSV columns do not match the template. Expected columns: ${expected.join(", ")}.`,
    };
  }

  return { valid: true, message: "" };
};

export default function AddBulkCampaignPage() {
  const navigate = useNavigate();
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [bulkFileName, setBulkFileName] = useState<string | null>(null);
  const [bulkPreview, setBulkPreview] = useState<{
    headers: string[];
    rows: string[][];
  } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const resetBulkUpload = () => {
    setBulkFileName(null);
    setBulkPreview(null);
    setIsPreviewing(false);
    setUploadError(null);
  };

  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!isCsvFile(file)) {
      toast.error("Only CSV files are allowed.");
      resetBulkUpload();
      setUploadError("Only CSV files are allowed.");
      return;
    }

    setIsParsing(true);
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text !== "string") {
        toast.error("Failed to read CSV file.");
        resetBulkUpload();
        setUploadError("Failed to read CSV file.");
        setIsParsing(false);
        return;
      }

      const parsed = parseCsv(text);
      if (parsed.headers.length === 0 || parsed.rows.length === 0) {
        toast.error("No data found in CSV file.");
        resetBulkUpload();
        setUploadError("No data found in CSV file.");
        setIsParsing(false);
        return;
      }

      const headerValidation = validateBulkCsvHeaders(parsed.headers);
      if (!headerValidation.valid) {
        toast.error(headerValidation.message);
        resetBulkUpload();
        setUploadError(headerValidation.message);
        setIsParsing(false);
        return;
      }

      setBulkFileName(file.name);
      setBulkPreview(parsed);
      setIsPreviewing(true);
      setUploadError(null);
      setIsParsing(false);
    };
    reader.onerror = () => {
      toast.error("Failed to read CSV file.");
      resetBulkUpload();
      setUploadError("Failed to read CSV file.");
      setIsParsing(false);
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const csvContent = [
      BULK_CAMPAIGN_TEMPLATE_COLUMNS,
      ...BULK_CAMPAIGN_TEMPLATE_SAMPLE_ROWS,
    ]
      .map((row) => row.map(escapeCsvField).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "campaign_upload_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <button
          onClick={() =>
            navigate("/campaign-management/merchant-campaign-list")
          }
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Campaign list
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100">
          <h1 className="text-lg font-bold text-slate-900 leading-tight">
            Bulk Campaign Upload
          </h1>
          <p className="text-[11px] font-medium text-slate-500 mt-0.5 uppercase tracking-wider">
            Upload a CSV file to create multiple campaigns at once.
          </p>
        </div>

        <div className="p-6 space-y-10">
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-sm">
                <FileUp className="w-10 h-10" />
              </div>
              <div className="max-w-md space-y-2">
                <h2 className="text-xl font-bold text-slate-800">
                  Upload Campaign Data
                </h2>
                <p className="text-sm text-slate-500 font-medium">
                  To add multiple campaigns efficiently, please download the
                  sample template, fill it with your data, and upload it here.
                </p>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100 transition-all shadow-sm"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  Download Template
                </button>
                <label className="flex items-center gap-2 px-8 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100 cursor-pointer active:scale-95">
                  <Upload className="w-4 h-4" />
                  <span className="truncate max-w-[200px]">Upload file</span>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={handleBulkFileChange}
                  />
                </label>
              </div>
            </div>

            {isParsing && (
              <div className="text-center text-sm font-medium text-slate-500">
                Reading uploaded file...
              </div>
            )}

            {uploadError && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="font-medium">{uploadError}</p>
              </div>
            )}

            {/* Preview Table Section */}
            {isPreviewing && bulkPreview && (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-sm text-slate-800 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary-600 shrink-0" />
                    <span className="font-bold">{bulkFileName}</span>
                    <span className="font-medium text-slate-600">
                      Data Preview
                    </span>
                  </h3>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                    {bulkPreview.rows.length} Records Found
                  </span>
                </div>
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto max-h-[500px] custom-scrollbar">
                    <table className="w-full text-left border-collapse bg-white">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200">
                          {bulkPreview.headers.map((header, colIdx) => (
                            <th
                              key={`${header}-${colIdx}`}
                              className="px-6 py-3.5 text-[11px] font-bold text-slate-600 uppercase tracking-tight border-r border-slate-100 last:border-0"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {bulkPreview.rows.map((row, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                          >
                            {bulkPreview.headers.map((header, colIdx) => (
                              <td
                                key={`${idx}-${header}-${colIdx}`}
                                className="px-6 py-3 text-[11px] font-medium text-slate-600 border-r border-slate-50 last:border-0"
                              >
                                {row[colIdx] ?? ""}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions / Guidance */}
            {!isPreviewing && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 text-blue-700 font-bold uppercase tracking-wider text-xs">
                    <Info className="w-4 h-4" />
                    Important Instructions
                  </div>
                  <ul className="space-y-2.5">
                    {[
                      "Only CSV files are allowed for bulk upload.",
                      "Use the same column names and date format as the Campaign list table (e.g. 22-Apr-25).",
                      "Campaign Name must be unique within the file.",
                      "Sectors should be comma-separated.",
                      "Max file size allowed is 5MB.",
                    ].map((text, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-blue-800 font-medium leading-relaxed"
                      >
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 shrink-0" />
                        {text}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 text-amber-700 font-bold uppercase tracking-wider text-xs">
                    <AlertCircle className="w-4 h-4" />
                    Required Columns
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {BULK_CAMPAIGN_TEMPLATE_COLUMNS.map((col) => (
                      <span
                        key={col}
                        className="px-3 py-1 bg-white border border-amber-200 text-amber-800 text-[10px] font-bold rounded-lg shadow-sm"
                      >
                        {col}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-amber-700 font-medium italic">
                    * All columns listed above are mandatory for a successful
                    upload.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Action */}
        <div className="px-6 py-6 border-t border-slate-100 bg-slate-50/30 flex justify-end gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
          >
            Close
          </button>
          <button
            disabled={!isPreviewing || !bulkPreview?.rows.length || isParsing}
            className={clsx(
              "px-10 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            Confirm Bulk Upload
          </button>
        </div>
      </div>
    </div>
  );
}
