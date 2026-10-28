import { useState } from "react";
import { Drawer } from "../../../components/Drawer";
import { MerchantTicketDrawer } from "./components/MerchantTicketDrawer";
import { MerchantTicketFilters } from "./components/MerchantTicketFilters";
import { MerchantTicketTable } from "./components/MerchantTicketTable";
import { useMerchantTickets } from "./hooks/useMerchantTickets";

export default function MerchantTicketsPage() {
  const {
    filters,
    handleFilterChange,
    handleClearFilters,
    filteredData,
    pagination,
    handlePageChange,
    isLoading,
  } = useMerchantTickets();

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Merchant Tickets</h1>
      </div>

      {/* Filters */}
      <MerchantTicketFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Table Area */}
      <MerchantTicketTable
        data={filteredData}
        pagination={pagination}
        onPageChange={handlePageChange}
        onViewDetails={setSelectedTicketId}
        onPreviewImage={setPreviewImageUrl}
        isLoading={isLoading}
      />

      {/* View Details Drawer */}
      <MerchantTicketDrawer
        ticketId={selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
        onPreviewImage={setPreviewImageUrl}
      />

      {/* Image Preview Drawer */}
      <Drawer
        open={!!previewImageUrl}
        onClose={() => setPreviewImageUrl(null)}
        title="Attachment Preview"
        width="xl"
      >
        <div className="flex items-center justify-center min-h-[400px] p-4 bg-slate-50 rounded-lg border border-slate-200">
          {previewImageUrl &&
            (previewImageUrl.toLowerCase().endsWith(".pdf") ? (
              <iframe
                src={previewImageUrl}
                className="w-full h-[calc(90vh-120px)] min-h-[600px] border-none shadow-2xl rounded-sm"
                title="PDF Attachment Preview"
              />
            ) : (
              <img
                src={previewImageUrl}
                alt="Full size attachment"
                className="max-w-full max-h-[80vh] object-contain shadow-2xl rounded-sm"
              />
            ))}
        </div>
      </Drawer>
    </div>
  );
}
