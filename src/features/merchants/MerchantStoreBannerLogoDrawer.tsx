import React, { useState } from "react";
import { Drawer } from "../../components/Drawer";
import { Image, Upload, Link, CheckCircle2, X } from "lucide-react";
import type { MerchantStore } from "../../data/mock/types";
import { clsx } from "clsx";
import toast from "react-hot-toast";

interface MerchantStoreBannerLogoDrawerProps {
  store: MerchantStore | null;
  merchantName?: string;
  onClose: () => void;
}

// ── Standard UI Components ───────────────────────────────────────────────────

const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center gap-3 mb-6 pb-2 border-b border-slate-100 mt-8 first:mt-0">
    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
      {title}
    </h2>
  </div>
);

const DetailRow = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex flex-col sm:flex-row sm:items-start py-3 text-sm border-b border-slate-50 last:border-0 hover:bg-slate-50/50 px-4 transition-colors">
    <dt className="w-full sm:w-1/2 text-slate-500 font-medium">{label}</dt>
    <dd className="w-full sm:w-1/2 font-semibold text-slate-900">
      {value || "—"}
    </dd>
  </div>
);

const FileUploadField = ({
  label,
  id,
  accept = "image/*",
}: {
  label: string;
  id: string;
  accept?: string;
}) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setPreview(URL.createObjectURL(file));
    } else {
      setFileName(null);
      setPreview(null);
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-xs font-bold text-slate-700 uppercase tracking-tight mb-2">
        {label}
      </label>
      <div className="relative group">
        <input
          type="file"
          id={id}
          accept={accept}
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div
          className={clsx(
            "w-full px-4 py-3 bg-white border-2 border-dashed rounded-xl transition-all flex items-center gap-3",
            fileName
              ? "border-emerald-200 bg-emerald-50/30"
              : "border-slate-200 group-hover:border-primary-400 group-hover:bg-primary-50/30",
          )}
        >
          <div
            className={clsx(
              "w-12 h-12 rounded-lg transition-all flex items-center justify-center overflow-hidden shrink-0",
              fileName
                ? "bg-emerald-100"
                : "bg-slate-100 group-hover:bg-primary-100",
            )}
          >
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <Upload className="w-5 h-5 text-slate-400 group-hover:text-primary-600 transition-colors" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={clsx(
                "text-sm font-bold truncate",
                fileName ? "text-emerald-700" : "text-slate-600",
              )}
            >
              {fileName || "Choose file or drag & drop"}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
              PNG, JPG or GIF (max. 2MB)
            </p>
          </div>
          {fileName && (
            <button
              onClick={(e) => {
                e.preventDefault();
                setFileName(null);
                setPreview(null);
              }}
              className="p-1.5 hover:bg-emerald-100 rounded-md text-emerald-600 relative z-20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────

export function MerchantStoreBannerLogoDrawer({
  store,
  merchantName,
  onClose,
}: MerchantStoreBannerLogoDrawerProps) {
  const [redirectUrl, setRedirectUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsSaving(false);
    toast.success(
      `Banner settings for ${store?.storeName} updated successfully!`,
    );
    onClose();
  };

  if (!store) return null;

  const customTitle = (
    <div className="flex flex-col gap-0.5">
      <div className="text-lg font-bold text-slate-900 leading-tight">
        Configuring Store Banner & Logo
      </div>
      <div className="text-xs text-primary-500 font-mono font-medium">
        {store.storeId}
      </div>
    </div>
  );

  return (
    <Drawer
      open={!!store}
      onClose={onClose}
      title={customTitle}
      width="xl"
      icon={<Image className="w-5 h-5 text-primary-600" />}
    >
      <div className="pb-32">
        {/* ── Store Information ── */}
        <SectionHeader title="Store Information" />
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <DetailRow label="Merchant Name" value={merchantName} />
          <DetailRow label="Store Name" value={store.storeName} />
        </div>

        {/* ── Configuration ── */}
        <SectionHeader title="Settings" />
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-tight mb-2 flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-slate-400" />
              Banner Redirect URL
            </label>
            <input
              type="text"
              value={redirectUrl}
              onChange={(e) => setRedirectUrl(e.target.value)}
              placeholder="https://example.com/promo"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm"
            />
            <p className="mt-2 text-[11px] text-slate-400 italic font-medium">
              The URL users will be taken to when clicking your store banner.
            </p>
          </div>
        </div>

        {/* ── Media Assets ── */}
        <SectionHeader title="Media Brand Assets" />
        <div className="grid grid-cols-1 gap-2">
          <FileUploadField label="Upload New Logo" id="logo_upload" />
          <FileUploadField label="Upload New Banner" id="banner_upload" />
          <FileUploadField
            label="Store Physical or Website Image"
            id="physical_upload"
          />
        </div>
      </div>

      {/* ── Sticky Footer ── */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/95 backdrop-blur-sm border-t border-slate-100 shadow-[0_-10px_20px_-15px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-12 py-3 bg-primary-600 text-white font-bold text-sm rounded-lg shadow-md hover:bg-primary-700 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {isSaving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </Drawer>
  );
}
