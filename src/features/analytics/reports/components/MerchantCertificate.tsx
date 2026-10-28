import { forwardRef } from "react";
import logoWireless from "../../../../assets/logo_ssl_wireless.svg";
import logoFooter from "../../../../assets/logo_footer.png";

interface MerchantCertificateProps {
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
  };
}

export const MerchantCertificate = forwardRef<
  HTMLDivElement,
  MerchantCertificateProps
>(({ merchantData }, ref) => {
  const yearParts = merchantData.year.split(/[-–—]|\s+-\s+/);
  const startYear = yearParts[0]?.trim() || "";
  const endYear = yearParts[1]?.trim() || startYear;

  const data = {
    period:
      merchantData.customData?.period ||
      `01 July ${startYear} to 30 June ${endYear}`,
    address:
      merchantData.customData?.address ||
      "M block, South Badda, Road 9, House 25",
    openingBalance: merchantData.customData?.openingBalance || "3,094,259.14",
    transactions: merchantData.customData?.transactions || "6,078.00",
    tdr: merchantData.customData?.tdr || "149.89",
    payableAmount: merchantData.customData?.payableAmount || "5,928.11",
    refundChargeback: merchantData.customData?.refundChargeback || "0.00",
    netPayable: merchantData.customData?.netPayable || "5,928.11",
    paidAmount: merchantData.customData?.paidAmount || "-714,339.32",
    closingBalance: merchantData.customData?.closingBalance || "720,267.43",
  };

  return (
    <div className="bg-slate-50 min-h-full flex flex-col">
      <div
        ref={ref}
        className="certificate-to-print bg-white shadow-sm w-full flex-1 p-12 text-slate-800 leading-relaxed relative overflow-hidden group flex flex-col"
      >
        {/* Letterhead */}
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-primary-700 leading-tight">
              Software Shop Limited
            </h1>
            <div className="text-[10px] text-slate-500 leading-tight">
              <p>
                Head Office: 93 B, New Eskaton Road, Dhaka-1000, Bangladesh.
              </p>
              <p>
                Branch Office: Standard Center, Level 4, 5 & 9, 27/1, New
                Eskaton Road, Dhaka-1000
              </p>
              <p>
                Chattogram Office: 318 B.M Height, Level 2, Sheikh Mujib Road,
                Agrabad, Badamtoli, Chattogram
              </p>
              <p>
                Tel: +880 961 222 1000, +880 2 4831 6009, +880 2 4831 5056
                Email: info@sslwireless.com | Website: www.sslwireless.com
              </p>
            </div>
          </div>
          <img
            src={logoWireless}
            alt="SSL Wireless"
            className="h-12 object-contain"
          />
        </div>

        {/* Date */}
        <div className="mb-6 text-sm">
          <p>
            {new Date().toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Recipient */}
        <div className="mb-6 text-center">
          <h2 className="text-lg font-bold border-b border-slate-300 inline-block px-4 pb-1">
            To Whom it May Concern
          </h2>
        </div>

        {/* Intro Text */}
        <div className="mb-6 text-sm space-y-4">
          <p>
            This is to inform that,{" "}
            <span className="font-bold">{merchantData.merchantName}</span>,
            Address: {data.address} has been maintaining an online merchant
            account with us. The Transactions summary Report for the period{" "}
            {data.period} is shown below.
          </p>
        </div>

        {/* Summary Table */}
        <div className="mb-8 rounded-md border border-slate-300 overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th
                  colSpan={2}
                  className="border-b border-slate-300 py-1.5 bg-primary-50 text-center leading-relaxed"
                >
                  Period : {data.period}
                </th>
              </tr>
              <tr className="border-b border-slate-300">
                <th className="border-r border-slate-300 px-3 py-1.5 text-left w-1/2">
                  Merchant Id
                </th>
                <td className="px-3 py-1.5 text-left">
                  {merchantData.merchantId}
                </td>
              </tr>
              <tr className="border-b border-slate-300">
                <th className="border-r border-slate-300 px-3 py-1.5 text-left">
                  Merchant Name
                </th>
                <td className="px-3 py-1.5 text-left">
                  {merchantData.merchantName}
                </td>
              </tr>
              <tr className="bg-primary-900 text-white text-base">
                <th className="border-r border-slate-300 px-3 py-1.5 text-left">
                  Particulars
                </th>
                <th className="px-3 py-1.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-300">
                <th className="border-r border-slate-300 px-3 py-1.5 text-left font-bold">
                  Opening Balance
                </th>
                <td className="px-3 py-1.5 text-right font-medium">
                  {data.openingBalance}
                </td>
              </tr>
              <tr className="border-b border-slate-300">
                <th className="border-r border-slate-300 px-3 py-1.5 text-left font-bold">
                  Transactions
                </th>
                <td className="px-3 py-1.5 text-right font-medium">
                  {data.transactions}
                </td>
              </tr>
              <tr className="border-b border-slate-300">
                <th className="border-r border-slate-300 px-3 py-1.5 text-left font-bold">
                  TDR:
                </th>
                <td className="px-3 py-1.5 text-right font-medium">
                  {data.tdr}
                </td>
              </tr>
              <tr className="border-b border-slate-300">
                <th className="border-r border-slate-300 px-3 py-1.5 text-left font-bold">
                  Payable Amount
                </th>
                <td className="px-3 py-1.5 text-right font-medium">
                  {data.payableAmount}
                </td>
              </tr>
              <tr className="border-b border-slate-300">
                <th className="border-r border-slate-300 px-3 py-1.5 text-left font-bold">
                  Refund and Chargeback:
                </th>
                <td className="px-3 py-1.5 text-right font-medium">
                  {data.refundChargeback}
                </td>
              </tr>
              <tr className="border-b border-slate-300">
                <th className="border-r border-slate-300 px-3 py-1.5 text-left font-bold">
                  Net Payable
                </th>
                <td className="px-3 py-1.5 text-right font-medium">
                  {data.netPayable}
                </td>
              </tr>
              <tr className="border-b border-slate-300">
                <th className="border-r border-slate-300 px-3 py-1.5 text-left font-bold">
                  Paid Amount
                </th>
                <td className="px-3 py-1.5 text-right font-medium">
                  {data.paidAmount}
                </td>
              </tr>
              <tr className="bg-primary-50">
                <th className="border-r border-slate-300 px-3 py-1.5 text-left font-bold">
                  Closing Balance:
                </th>
                <td className="px-3 py-1.5 text-right font-bold">
                  {data.closingBalance}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Outro Text */}
        <div
          className="mb-12 text-slate-500 italic"
          style={{ fontSize: "11px" }}
        >
          <p>
            This certificate is produced upon the request of the merchant, and
            the liability of this certificate is limited to the information
            mentioned above.
          </p>
        </div>

        {/* Signatory */}
        <div className="mb-8 text-sm">
          <p>Authorized Signatory</p>
          <p className="font-bold mt-1">Mohammad Omar Faruque</p>
          <p className="text-slate-600">Manager, Finance & Accounts</p>
        </div>

        {/* Bottom Disclaimer */}
        <div className="mt-auto text-center text-[10px] text-slate-400 mb-5">
          <p>System generated document. No signature required.</p>
        </div>

        {/* Footer Logos */}
        <div className="flex justify-center pb-2">
          <img
            src={logoFooter}
            alt="Brand Logos"
            className="w-[85%] h-auto opacity-100 transition-all duration-500"
          />
        </div>
      </div>
    </div>
  );
});

MerchantCertificate.displayName = "MerchantCertificate";
