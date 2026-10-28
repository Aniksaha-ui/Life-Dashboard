import { useRef } from "react";
import { Download, Printer, FileText } from "lucide-react";
import { Drawer } from "../../../../components/Drawer";
import { MerchantCertificate } from "./MerchantCertificate";
import { generateCertificatePDF } from "../utils/pdfGenerator";

interface MerchantCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchantData: {
    merchantId: string;
    merchantName: string;
    year: string;
    customData?: {
      period?: string;
      address?: string;
      openingBalance?: string;
      transactions?: string;
      tdr?: string;
      payableAmount?: string;
      refundChargeback?: string;
      netPayable?: string;
      paidAmount?: string;
      closingBalance?: string;
    };
  } | null;
}

export function MerchantCertificateModal({
  isOpen,
  onClose,
  merchantData,
}: MerchantCertificateModalProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  if (!merchantData) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    const filename = `Merchant_Certificate_${merchantData.merchantId}_${merchantData.year}.pdf`;
    await generateCertificatePDF(certificateRef.current, filename);
  };

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      width="4xl"
      noPadding
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-50 rounded-lg">
            <FileText className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-none">
              Certificate Preview
            </h2>
            <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider font-medium">
              Financial Year {merchantData.year}
            </p>
          </div>
        </div>
      }
      headerAction={
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            title="Print Certificate"
          >
            <Printer className="w-5 h-5" />
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-xs font-bold rounded-lg hover:bg-primary-700 transition-all shadow-sm active:scale-95"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      }
    >
      <MerchantCertificate ref={certificateRef} merchantData={merchantData} />
    </Drawer>
  );
}
