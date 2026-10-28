import { Drawer } from "../../components/Drawer";
import {
  Download,
  ClipboardList,
  Info,
  Receipt,
  Search,
  Send,
  CheckCircle,
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import { Modal } from "../../components/Modal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api/client";

interface SettlementSummaryDrawerProps {
  open: boolean;
  onClose: () => void;
  resellerName?: string;
  resellerId?: string;
}

interface SettlementTxn {
  slNo: number;
  requestedOn: string;
  storeName: string;
  transAmount: number;
  bankCommission: number;
  bankSslId: string;
  bankApprovalCode: string;
  cardNumber: string;
  cardHolderName: string;
  emiTenure: number;
}

const SETTLEMENT_TXNS: SettlementTxn[] = [
  {
    slNo: 80386,
    requestedOn: "2026-04-26 14:43:16",
    storeName: "SSLCOMMERZDINVOICE",
    transAmount: 29664.31,
    bankCommission: 1779.86,
    bankSslId: "UCS22982026042693801",
    bankApprovalCode: "997383",
    cardNumber: "417022XXXXXX3146",
    cardHolderName: "S. M. SAAD BIN ZAHID",
    emiTenure: 12,
  },
  {
    slNo: 80387,
    requestedOn: "2026-04-26 16:09:32",
    storeName: "SSLCOMMERZDINVOICE",
    transAmount: 119550.77,
    bankCommission: 14346.09,
    bankSslId: "UCS321320260426107267",
    bankApprovalCode: "173214",
    cardNumber: "417022XXXXXX8998",
    cardHolderName: "Mst tania",
    emiTenure: 24,
  },
  {
    slNo: 80388,
    requestedOn: "2026-04-27 18:34:28",
    storeName: "SSLCOMMERZDINVOICE",
    transAmount: 84900.0,
    bankCommission: 1698.0,
    bankSslId: "UCS546120260427120071",
    bankApprovalCode: "043408",
    cardNumber: "417022XXXXXX4109",
    cardHolderName: "S M Humayun Kabir Zunnur",
    emiTenure: 3,
  },
  {
    slNo: 80389,
    requestedOn: "2026-05-08 10:23:31",
    storeName: "SHOP.VIVOBD",
    transAmount: 26999.0,
    bankCommission: 1619.94,
    bankSslId: "EC29232026050882422",
    bankApprovalCode: "069380",
    cardNumber: "417022XXXXXX6080",
    cardHolderName: "SIBBIR AHMED",
    emiTenure: 12,
  },
  {
    slNo: 80390,
    requestedOn: "2026-05-08 19:45:29",
    storeName: "stararena30",
    transAmount: 33455.99,
    bankCommission: 2007.36,
    bankSslId: "UCS415720260508221866",
    bankApprovalCode: "938234",
    cardNumber: "417022XXXXXX8522",
    cardHolderName: "MIR MD FERDAUS",
    emiTenure: 12,
  },
  {
    slNo: 80391,
    requestedOn: "2026-05-10 20:10:28",
    storeName: "SSLCOMMERZDINVOICE",
    transAmount: 46615.35,
    bankCommission: 2796.92,
    bankSslId: "UCS938120260510213397",
    bankApprovalCode: "616939",
    cardNumber: "417022XXXXXX8254",
    cardHolderName: "MD. MOHSIN SARKER",
    emiTenure: 12,
  },
  {
    slNo: 80392,
    requestedOn: "2026-05-10 22:37:09",
    storeName: "HIRAKRAJA",
    transAmount: 38248.52,
    bankCommission: 4589.82,
    bankSslId: "BCA672720260510261602",
    bankApprovalCode: "874209",
    cardNumber: "417022XXXXXX8553",
    cardHolderName: "Nigar Sultana Tania",
    emiTenure: 24,
  },
  {
    slNo: 80393,
    requestedOn: "2026-05-11 16:22:15",
    storeName: "msabirtele",
    transAmount: 67208.76,
    bankCommission: 3360.44,
    bankSslId: "UCS447120260511146064",
    bankApprovalCode: "149909",
    cardNumber: "417022XXXXXX5002",
    cardHolderName: "Ebrahim Khalil",
    emiTenure: 9,
  },
  {
    slNo: 80394,
    requestedOn: "2026-05-12 18:26:22",
    storeName: "COMPUTER_MANIA_BD",
    transAmount: 222195.36,
    bankCommission: 26663.44,
    bankSslId: "SZA290920260512164230",
    bankApprovalCode: "613212006166",
    cardNumber: "417022XXXXXX4337",
    cardHolderName: "Mahmuda Dewan",
    emiTenure: 24,
  },
  {
    slNo: 80395,
    requestedOn: "2026-05-13 11:59:19",
    storeName: "SHOP.ALHARAMAINPERFUM",
    transAmount: 7728.0,
    bankCommission: 463.68,
    bankSslId: "EC45042026051380779",
    bankApprovalCode: "631687",
    cardNumber: "417022XXXXXX2291",
    cardHolderName: "MD MAZHARUL ISLAM",
    emiTenure: 12,
  },
  {
    slNo: 80396,
    requestedOn: "2026-05-13 18:53:03",
    storeName: "SSLCOMMERZDINVOICE",
    transAmount: 16831.48,
    bankCommission: 336.63,
    bankSslId: "UCS780920260513171044",
    bankApprovalCode: "569083",
    cardNumber: "417022XXXXXX7934",
    cardHolderName: "salina akter",
    emiTenure: 3,
  },
  {
    slNo: 80397,
    requestedOn: "2026-05-14 15:27:38",
    storeName: "TECHLANDBD",
    transAmount: 9276.44,
    bankCommission: 463.82,
    bankSslId: "EC903720260514127301",
    bankApprovalCode: "118043",
    cardNumber: "417022XXXXXX4578",
    cardHolderName: "MST JAHURA PARVIN",
    emiTenure: 9,
  },
  {
    slNo: 80398,
    requestedOn: "2026-05-16 12:38:45",
    storeName: "SSLCOMMERZDINVOICE",
    transAmount: 274253.34,
    bankCommission: 52108.13,
    bankSslId: "SZA73752026051686511",
    bankApprovalCode: "613606143827",
    cardNumber: "417022XXXXXX5662",
    cardHolderName: "Ashif Mohammad",
    emiTenure: 36,
  },
  {
    slNo: 80399,
    requestedOn: "2026-05-16 19:50:52",
    storeName: "SSLCOMMERZDINVOICE",
    transAmount: 76674.76,
    bankCommission: 6900.73,
    bankSslId: "UCS979020260516168681",
    bankApprovalCode: "959441",
    cardNumber: "417022XXXXXX1988",
    cardHolderName: "ANIKA TABASSUM",
    emiTenure: 18,
  },
  {
    slNo: 80400,
    requestedOn: "2026-05-17 19:40:36",
    storeName: "SSLCOMMERZDINVOICE",
    transAmount: 102523.84,
    bankCommission: 12302.86,
    bankSslId: "SZA694020260517175083",
    bankApprovalCode: "613713161121",
    cardNumber: "417022XXXXXX6779",
    cardHolderName: "SARKER ATIKA SULTANA",
    emiTenure: 24,
  },
  {
    slNo: 80401,
    requestedOn: "2026-05-19 19:51:41",
    storeName: "SSLCOMMERZDINVOICE",
    transAmount: 42739.58,
    bankCommission: 1282.19,
    bankSslId: "UCS401920260519190066",
    bankApprovalCode: "128062",
    cardNumber: "417022XXXXXX8096",
    cardHolderName: "MD MAHBUBUZZAMAN",
    emiTenure: 6,
  },
  {
    slNo: 80402,
    requestedOn: "2026-05-20 12:31:03",
    storeName: "SSLCOMMERZDINVOICE",
    transAmount: 78063.99,
    bankCommission: 4683.84,
    bankSslId: "SZA42482026052097733",
    bankApprovalCode: "614006241059",
    cardNumber: "417022XXXXXX7077",
    cardHolderName: "Md tanver ur rahman",
    emiTenure: 12,
  },
  {
    slNo: 80403,
    requestedOn: "2026-05-20 18:18:39",
    storeName: "SSLCOMMERZ",
    transAmount: 27351.15,
    bankCommission: 547.02,
    bankSslId: "UCS253620260520171091",
    bankApprovalCode: "044000",
    cardNumber: "417022XXXXXX6921",
    cardHolderName: "Md Omar Ali",
    emiTenure: 3,
  },
  {
    slNo: 80404,
    requestedOn: "2026-05-21 13:11:18",
    storeName: "COMPUTER_MANIA_BD",
    transAmount: 27880.0,
    bankCommission: 1672.8,
    bankSslId: "SZA589920260521104010",
    bankApprovalCode: "614107274082",
    cardNumber: "417022XXXXXX4337",
    cardHolderName: "Mahmuda Dewan",
    emiTenure: 12,
  },
  {
    slNo: 80405,
    requestedOn: "2026-05-22 16:13:09",
    storeName: "SSLCOMMERZDINVOICE",
    transAmount: 57196.25,
    bankCommission: 1715.89,
    bankSslId: "UCS867120260522142086",
    bankApprovalCode: "127838",
    cardNumber: "417022XXXXXX1781",
    cardHolderName: "MD SOLAIMAN",
    emiTenure: 6,
  },
  {
    slNo: 80406,
    requestedOn: "2026-05-24 18:51:10",
    storeName: "SSLCOMMERZDINVOICE",
    transAmount: 47953.59,
    bankCommission: 2877.22,
    bankSslId: "UCS859120260524187014",
    bankApprovalCode: "298961",
    cardNumber: "417022XXXXXX5419",
    cardHolderName: "ZAHIDUL ISLAM",
    emiTenure: 12,
  },
];

export function SettlementSummaryDrawer({
  open,
  onClose,
  resellerId,
}: SettlementSummaryDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const pageSize = 5;

  const queryClient = useQueryClient();

  const { data: apResellers = [] } = useQuery({
    queryKey: ["ap-resellers-list"],
    queryFn: () => api.apResellers.list(),
    enabled: open,
  });

  const reseller = useMemo(() => {
    return apResellers.find((r) => r.resellerId === resellerId);
  }, [apResellers, resellerId]);

  const mutation = useMutation({
    mutationFn: () => api.apResellers.initiateSettlement(reseller!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ap-resellers-list"] });
      toast.success("Email sent to Islami Bank Bangladesh successfully");
      setIsConfirmOpen(false);
    },
    onError: () => {
      toast.error("Failed to initiate settlement");
    },
  });

  const handleConfirmSend = () => {
    if (!reseller) return;
    mutation.mutate();
  };

  const filteredTxns = useMemo(() => {
    if (!searchQuery.trim()) return SETTLEMENT_TXNS;
    const query = searchQuery.toLowerCase();
    return SETTLEMENT_TXNS.filter(
      (t) =>
        t.storeName.toLowerCase().includes(query) ||
        t.bankSslId.toLowerCase().includes(query) ||
        t.bankApprovalCode.toLowerCase().includes(query) ||
        t.cardHolderName.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredTxns.length / pageSize));

  const paginatedTxns = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTxns.slice(start, start + pageSize);
  }, [filteredTxns, currentPage, pageSize]);

  const totalTxnAmount = useMemo(
    () => SETTLEMENT_TXNS.reduce((acc, t) => acc + t.transAmount, 0),
    [],
  );
  const totalCommission = useMemo(
    () => SETTLEMENT_TXNS.reduce((acc, t) => acc + t.bankCommission, 0),
    [],
  );

  const handleExportCSV = () => {
    // Build styled HTML content for Excel (.xls)
    const html = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: Arial, sans-serif; font-size: 11px; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
                    .header-title { font-size: 12px; font-weight: bold; background-color: #f5f5fa; color: #1e293b; }
                    .label { font-weight: bold; color: #475569; background-color: #f5f5fa; }
                    .value { color: #334155; background-color: #f5f5fa; }
                    .spacer { background-color: #ffffff; border: none; }
                    .th-txn { background-color: #f8fafc; font-weight: bold; color: #475569; font-size: 10px; text-transform: uppercase; }
                    .text-right { text-align: right; }
                    .text-center { text-align: center; }
                    .totals-row { background-color: #f8fafc; font-weight: bold; color: #0f172a; }
                </style>
                <!--[if gte mso 9]>
                <xml>
                    <x:ExcelWorkbook>
                        <x:ExcelWorksheets>
                            <x:ExcelWorksheet>
                                <x:Name>Settlement Details</x:Name>
                                <x:WorksheetOptions>
                                    <x:FreezePanes/>
                                    <x:SplitHorizontal>11</x:SplitHorizontal>
                                    <x:TopRowBottomPane>11</x:TopRowBottomPane>
                                    <x:ActivePane>2</x:ActivePane>
                                </x:WorksheetOptions>
                            </x:ExcelWorksheet>
                        </x:ExcelWorksheets>
                    </x:ExcelWorkbook>
                </xml>
                <![endif]-->
            </head>
            <body>
                <table>
                    <!-- Main Title Row -->
                    <tr>
                        <td colspan="8" style="font-size: 14px; font-weight: bold; color: #0f172a; border: none; padding-bottom: 8px;">
                            EMI settlement details for ISLAMI BANK BANGLADESH (26 Apr 2026 to 25 May 2026)
                        </td>
                    </tr>
                    <tr><td colspan="8" class="spacer" style="height: 10px;"></td></tr>
                    
                    <!-- Summary block side-by-side on same rows with #f5f5fa background -->
                    <tr>
                        <td colspan="2" class="header-title">EMI Settlement Summary</td>
                        <td class="spacer"></td>
                        <td colspan="2" class="header-title">Payment Information</td>
                        <td colspan="3" class="spacer"></td>
                    </tr>
                    <tr>
                        <td class="label">Bank</td>
                        <td class="value">ISLAMI BANK BANGLADESH</td>
                        <td class="spacer"></td>
                        <td class="label">Payment Date</td>
                        <td class="value">Tue, 30 Jun 2026</td>
                        <td colspan="3" class="spacer"></td>
                    </tr>
                    <tr>
                        <td class="label">Date Range</td>
                        <td class="value">26 Apr 2026 to 25 May 2026</td>
                        <td class="spacer"></td>
                        <td class="label">Account Payee</td>
                        <td class="value">Commission on EMI</td>
                        <td colspan="3" class="spacer"></td>
                    </tr>
                    <tr>
                        <td class="label">Total EMIs</td>
                        <td class="value">21</td>
                        <td class="spacer"></td>
                        <td class="label">Account No</td>
                        <td class="value">'20503589971004706</td>
                        <td colspan="3" class="spacer"></td>
                    </tr>
                    <tr>
                        <td class="label">Total Amount</td>
                        <td class="value">৳ ${totalCommission.toFixed(2)}</td>
                        <td class="spacer"></td>
                        <td class="label">Reference No</td>
                        <td class="value">EB03H20260605A4F052</td>
                        <td colspan="3" class="spacer"></td>
                    </tr>
                    <tr>
                        <td colspan="2" class="spacer"></td>
                        <td class="spacer"></td>
                        <td class="label">Paid Amount</td>
                        <td class="value">৳ ${totalCommission.toFixed(2)}</td>
                        <td colspan="3" class="spacer"></td>
                    </tr>
                    
                    <!-- Empty separator rows -->
                    <tr><td colspan="8" class="spacer" style="height: 15px;"></td></tr>
                    
                    <tr>
                        <td colspan="8" style="font-size: 12px; font-weight: bold; border: none; padding-bottom: 8px;">Transaction Details</td>
                    </tr>
                    
                    <!-- Table Headers -->
                    <tr>
                        <th class="th-txn text-center">Sl</th>
                        <th class="th-txn">Requested On</th>
                        <th class="th-txn">Store Name</th>
                        <th class="th-txn text-right">Trans Amount</th>
                        <th class="th-txn text-right">Commission</th>
                        <th class="th-txn">Bank SSL ID</th>
                        <th class="th-txn text-center">Approval Code</th>
                        <th class="th-txn">Card Number</th>
                    </tr>
                    
                    <!-- Table Rows -->
                    ${SETTLEMENT_TXNS.map(
                      (txn, index) => `
                        <tr>
                            <td class="text-center">${index + 1}</td>
                            <td>${txn.requestedOn}</td>
                            <td>${txn.storeName}</td>
                            <td class="text-right">৳ ${txn.transAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                            <td class="text-right">৳ ${txn.bankCommission.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                            <td>${txn.bankSslId}</td>
                            <td class="text-center">${txn.bankApprovalCode}</td>
                            <td>${txn.cardNumber}</td>
                        </tr>
                    `,
                    ).join("")}
                    
                    <!-- Totals Row -->
                    <tr class="totals-row">
                        <td class="text-center"></td>
                        <td></td>
                        <td>Total Summary</td>
                        <td class="text-right">৳ ${totalTxnAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td class="text-right">৳ ${totalCommission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td></td>
                        <td class="text-center"></td>
                        <td></td>
                    </tr>
                </table>
            </body>
            </html>
        `;

    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `settlement_details_${resellerId || "export"}_EB03H20260605A4F052.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Styled Excel report downloaded successfully");
  };

  const title = (
    <span className="text-base font-bold text-slate-900 leading-tight block pr-8">
      EMI settlement details for ISLAMI BANK BANGLADESH (26 Apr 2026 to 25 May
      2026)
    </span>
  );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={title}
      width="5xl"
      noPadding
      contentClassName="flex flex-col h-full overflow-hidden"
    >
      {/* Action Bar */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <ClipboardList className="w-4 h-4 text-slate-400" />
          <span>Reseller ID: {resellerId || "N/A"}</span>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          Download Detailed Report
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Side-by-side Overview Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* EMI Settlement Summary Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden transition-all hover:border-slate-300">
            <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">
                EMI Settlement Summary
              </h4>
            </div>
            <div className="p-5 grid grid-cols-2 gap-y-4 gap-x-6 text-xs">
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Bank
                </span>
                <span
                  className="text-slate-955 font-semibold mt-1 block"
                  style={{ color: "#090d16" }}
                >
                  ISLAMI BANK BANGLADESH
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Date Range
                </span>
                <span
                  className="text-slate-955 font-semibold mt-1 block"
                  style={{ color: "#090d16" }}
                >
                  26 Apr 2026 to 25 May 2026
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total EMIs
                </span>
                <span
                  className="text-slate-955 font-semibold mt-1 block"
                  style={{ color: "#090d16" }}
                >
                  21
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Amount
                </span>
                <span
                  className="font-bold text-sm mt-0.5 block"
                  style={{ color: "#090d16" }}
                >
                  ৳{" "}
                  {totalCommission.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Information Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden transition-all hover:border-slate-300">
            <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">
                Payment Information
              </h4>
            </div>
            <div className="p-5 grid grid-cols-2 gap-y-4 gap-x-6 text-xs">
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Payment Date
                </span>
                <span
                  className="text-slate-955 font-semibold mt-1 block"
                  style={{ color: "#090d16" }}
                >
                  Tue, 30 Jun 2026
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Account Payee
                </span>
                <span
                  className="text-slate-955 font-semibold mt-1 block"
                  style={{ color: "#090d16" }}
                >
                  Commission on EMI
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Account No
                </span>
                <span
                  className="text-slate-955 font-semibold mt-1 block"
                  style={{ color: "#090d16" }}
                >
                  20503589971004706
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Reference No
                </span>
                <span
                  className="font-bold mt-1 block hover:underline cursor-pointer"
                  style={{ color: "#090d16" }}
                  onClick={() => {
                    navigator.clipboard.writeText("EB03H20260605A4F052");
                    toast.success("Reference No copied to clipboard");
                  }}
                  title="Click to copy"
                >
                  EB03H20260605A4F052
                </span>
              </div>
              <div className="col-span-2">
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Paid Amount
                  </span>
                  <span
                    className="font-bold text-base"
                    style={{ color: "#090d16" }}
                  >
                    ৳{" "}
                    {totalCommission.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Transactions */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h4 className="text-sm font-bold text-slate-900">
            Transaction Details
          </h4>

          <div className="flex items-center justify-between gap-3">
            <div className="relative w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by store name, approval code..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 bg-white text-slate-800 transition-all"
              />
            </div>
            <span className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 text-slate-600 rounded-full border border-slate-200 shadow-sm shrink-0">
              Total: {filteredTxns.length} Transactions
            </span>
          </div>

          {/* Transactions Table */}
          <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm bg-white">
            <table className="w-full text-left border-collapse text-xs table-fixed">
              <colgroup>
                <col className="w-[4%]" />
                <col className="w-[14%]" />
                <col className="w-[18%]" />
                <col className="w-[11%]" />
                <col className="w-[11%]" />
                <col className="w-[20%]" />
                <col className="w-[10%]" />
                <col className="w-[12%]" />
              </colgroup>
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[9px] font-bold">
                <tr>
                  <th className="px-2 py-3 text-center">Sl</th>
                  <th className="px-2 py-3">Requested On</th>
                  <th className="px-2 py-3">Store Name</th>
                  <th className="px-2 py-3 text-right">Trans Amount</th>
                  <th className="px-2 py-3 text-right">Commission</th>
                  <th className="px-2 py-3">Bank SSL ID</th>
                  <th className="px-2 py-3 text-center">Approval Code</th>
                  <th className="px-2 py-3">Card Number</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-normal">
                {paginatedTxns.map((txn) => (
                  <tr
                    key={txn.slNo}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-2 py-3 text-center text-slate-700">
                      {txn.slNo - 80385}
                    </td>
                    <td
                      className="px-2 py-3 text-slate-700 truncate"
                      title={txn.requestedOn}
                    >
                      {txn.requestedOn}
                    </td>
                    <td
                      className="px-2 py-3 text-slate-700 truncate"
                      title={txn.storeName}
                    >
                      {txn.storeName}
                    </td>
                    <td className="px-2 py-3 text-right text-slate-700">
                      ৳{" "}
                      {txn.transAmount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-2 py-3 text-right text-slate-700">
                      ৳{" "}
                      {txn.bankCommission.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td
                      className="px-2 py-3 text-slate-700 truncate"
                      title={txn.bankSslId}
                    >
                      {txn.bankSslId}
                    </td>
                    <td className="px-2 py-3 text-center text-slate-700">
                      {txn.bankApprovalCode}
                    </td>
                    <td
                      className="px-2 py-3 text-slate-700 truncate"
                      title={txn.cardNumber}
                    >
                      {txn.cardNumber}
                    </td>
                  </tr>
                ))}

                {/* Totals Row styled matching the body rows */}
                <tr className="bg-slate-50 font-bold text-xs text-slate-900 border-t border-slate-200">
                  <td className="px-2 py-3 text-center w-[4%]">&nbsp;</td>
                  <td className="px-2 py-3 w-[14%]">&nbsp;</td>
                  <td className="px-2 py-3 text-slate-900 font-bold whitespace-nowrap w-[18%]">
                    Total Summary
                  </td>
                  <td className="px-2 py-3 text-right text-slate-900 whitespace-nowrap w-[11%]">
                    ৳{" "}
                    {totalTxnAmount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-2 py-3 text-right text-slate-900 whitespace-nowrap w-[11%]">
                    ৳{" "}
                    {totalCommission.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-2 py-3 w-[20%]">&nbsp;</td>
                  <td className="px-2 py-3 text-center w-[10%]">&nbsp;</td>
                  <td className="px-2 py-3 w-[12%]">&nbsp;</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border border-slate-200 rounded-lg bg-white shadow-sm">
              <p className="text-xs text-slate-500">
                Showing {(currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, filteredTxns.length)} of{" "}
                {filteredTxns.length} entries
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-2.5 py-1 text-xs font-semibold border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer text-slate-600"
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span className="text-xs font-semibold text-slate-600 select-none">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  className="px-2.5 py-1 text-xs font-semibold border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer shadow-sm text-slate-600"
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-between items-center shrink-0">
        <div className="flex-1">
          {reseller?.raApprovalStatus === "Settlement Initiate" ? (
            <div className="flex items-center gap-2 text-primary-800 bg-primary-50 border border-primary-100 px-3 py-2 rounded-lg text-xs font-semibold animate-fade-in">
              <Info className="w-4 h-4 text-primary-600 flex-shrink-0" />
              <span>
                Settlement Email initiated & sent to Islami Bank Bangladesh
                successfully. Status updated to Settlement Initiate.
              </span>
            </div>
          ) : reseller?.raApprovalStatus === "Settlement Done" ? (
            <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg text-xs font-semibold animate-fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                EMI Settlement process completed & payment disbursed for Islami
                Bank Bangladesh. Status is Settlement Done.
              </span>
            </div>
          ) : (
            <div />
          )}
        </div>
        {reseller?.raApprovalStatus !== "Settlement Initiate" &&
          reseller?.raApprovalStatus !== "Settlement Done" && (
            <button
              onClick={() => setIsConfirmOpen(true)}
              className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 border border-primary-600 rounded-lg hover:bg-primary-700 hover:border-primary-700 transition-colors shadow-sm cursor-pointer ml-4"
            >
              Send Email to Bank
            </button>
          )}
      </div>

      {/* Confirm Send Email Modal */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirm Settlement Initiation"
        footer={
          <>
            <button
              type="button"
              className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => setIsConfirmOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={mutation.isPending}
              className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors cursor-pointer"
              onClick={handleConfirmSend}
            >
              {mutation.isPending ? "Sending..." : "Confirm"}
            </button>
          </>
        }
      >
        <p className="text-slate-600 text-sm leading-relaxed">
          Are you sure you want to send the settlement details email to Islami
          Bank Bangladesh? This will initiate the settlement process for this
          reseller and update the status to "Settlement Initiate".
        </p>
      </Modal>
    </Drawer>
  );
}
