import { useParams, useNavigate } from "react-router-dom";
import { Drawer } from "../../components/Drawer";
import { clsx } from "clsx";
import logo from "../../assets/logo_ssl_commerz.svg";

export default function EmailLogDrawer() {
  const { logId } = useParams();
  const navigate = useNavigate();

  const onClose = () => navigate("/email-logs");

  // Mock data for the specific log
  const logDetails = {
    id: logId,
    to: "sajan.sslwireless@gmail.com",
    cc: 'support@sslcommerz.com","operations-team@sslcommerz.com',
    bcc: "audit@sslcommerz.com",
    subject: "SSLCOMMERZ Merchant Hold Notification",
    status: "Initiated",
    mailableName: "ESCROW_CONFIRMATION",
    date: "2023-11-21 21:21:18",
  };

  const customTitle = (
    <div className="space-y-1">
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold text-slate-900 tracking-tight">
          Email Details
        </span>
        <span className="text-sm text-slate-500 font-medium">ID: {logId}</span>
      </div>
    </div>
  );

  return (
    <Drawer open={true} onClose={onClose} title={customTitle} width="3xl">
      <div className="space-y-6">
        <div className="space-y-8 pb-8">
          {/* Recipient Information Section */}
          <section>
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">
              Recipient Info
            </h3>
            <div className="bg-white rounded-lg border border-slate-200 px-4 divide-y divide-slate-100 shadow-sm">
              <DetailRow label="To" value={logDetails.to} isBold />
              <DetailRow label="CC" value={logDetails.cc} multiline />
              <DetailRow label="BCC" value={logDetails.bcc} />
              <DetailRow label="Subject" value={logDetails.subject} isBold />
              <div className="flex flex-col sm:flex-row sm:items-start py-3 text-sm">
                <dt className="w-full sm:w-1/3 text-slate-500 font-semibold uppercase tracking-tight text-[11px] py-0.5">
                  Status
                </dt>
                <dd className="w-full sm:w-2/3 text-slate-900 leading-relaxed">
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase tracking-wider whitespace-nowrap">
                    initial
                  </span>
                </dd>
              </div>
            </div>
          </section>

          {/* Email Content Section */}
          <section>
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">
              Message Content
            </h3>

            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm px-4 py-3">
              <div className="p-0">
                {/* Email Paper (Seamless integration) */}
                <div className="bg-white w-full mx-auto overflow-hidden">
                  <div className="space-y-6 text-slate-700 leading-relaxed font-sans antialiased text-sm">
                    {/* SSLCOMMERZ Branding */}
                    <div className="flex justify-start mb-6">
                      <img
                        src={logo}
                        alt="SSLCOMMERZ"
                        className="h-8 w-auto select-none"
                      />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-base font-bold text-slate-900">
                        Dear Sir,
                      </h3>
                      <p className="text-xs font-semibold text-slate-500 italic">
                        Greetings From SSLCOMMERZ!
                      </p>

                      <p className="text-[13px]">
                        We have received an email from gateway bank regarding
                        following transactions. Please review the following
                        details and provide us with the service status, along
                        with relevant supporting documents.
                      </p>

                      {/* Nested Data Table */}
                      <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm">
                        <table className="w-full text-[11px] text-center border-collapse">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                            <tr>
                              <th className="px-3 py-3 border-r border-slate-100">
                                Store Name
                              </th>
                              <th className="px-3 py-3 border-r border-slate-100">
                                Transaction ID
                              </th>
                              <th className="px-3 py-3 border-r border-slate-100">
                                Hold Ref ID
                              </th>
                              <th className="px-3 py-3 border-r border-slate-100">
                                Hold Amount
                              </th>
                              <th className="px-3 py-3 border-r border-slate-100">
                                Request On
                              </th>
                              <th className="px-3 py-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-slate-100">
                            <tr className="hover:bg-slate-50/50 transition-colors font-medium text-[10px]">
                              <td className="px-3 py-4 text-slate-600 border-r border-slate-100 whitespace-nowrap">
                                Rong Mela
                              </td>
                              <td className="px-3 py-4 text-slate-600 border-r border-slate-100 tracking-tighter">
                                FRMSBDDH-SSLCZ_2037_62e0c80768e98
                              </td>
                              <td className="px-3 py-4 text-slate-800 font-bold border-r border-slate-100">
                                H220730021233-27566
                              </td>
                              <td className="px-3 py-4 text-slate-900 font-bold border-r border-slate-100 whitespace-nowrap">
                                500.00 BDT
                              </td>
                              <td className="px-3 py-4 text-slate-500 border-r border-slate-100 uppercase tracking-tight leading-tight">
                                30 Jul 2022
                                <br />
                                02:12 AM
                              </td>
                              <td className="px-3 py-4">
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider whitespace-nowrap">
                                  sent
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Instructional Checklist - Neutral/Grey Style */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                        <h4 className="text-[13px] font-bold text-slate-900 leading-tight">
                          If the service has been provided, please send us the
                          following:
                        </h4>
                        <ul className="grid grid-cols-1 gap-2.5 ml-4">
                          {[
                            "Proof of Service Delivery (PDF format, if possible)",
                            "Receipts/Invoices (indicating service completion with product details)",
                            "Customer acknowledgement",
                          ].map((item, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-[12px] font-medium text-slate-600/90 leading-snug"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <p className="text-[13px] text-slate-700 leading-relaxed font-semibold px-1">
                        We are currently holding the transactions. Kindly review
                        the issue from your end and provide us an update at your
                        earliest convenience.
                      </p>

                      {/* Status Notice - Warning Style */}
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm">
                        <p className="text-[12px] text-amber-800 font-bold leading-relaxed italic">
                          Please note, we are temporarily holding your
                          settlement for investigation purpose.
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        <p className="text-[13px] font-bold text-slate-800">
                          Best Regards,
                        </p>
                        <p className="text-[13px] font-bold text-slate-900">
                          SSLCOMMERZ Team
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 text-center space-y-2">
              <p className="text-[10px] text-slate-500 font-medium">
                93 B, New Eskaton Road, Dhaka-1000{" "}
                <span className="mx-2 text-slate-300">|</span> Phone:
                +880-9612-226969, +880-2-8316969
              </p>
              <p className="text-[10px] text-slate-500 font-medium">
                E-mail:{" "}
                <span className="text-primary-600">support@sslcommerz.com</span>{" "}
                <span className="mx-2 text-slate-300">|</span> Web:{" "}
                <span className="text-primary-600 underline">
                  www.sslcommerz.com
                </span>
              </p>
            </div>
          </section>
        </div>
      </div>
    </Drawer>
  );
}

const DetailRow = ({
  label,
  value,
  isBold,
  multiline,
}: {
  label: string;
  value?: string;
  isBold?: boolean;
  multiline?: boolean;
}) => (
  <div
    className={clsx(
      "flex flex-col sm:flex-row sm:items-start py-3 text-sm",
      multiline && "items-start",
    )}
  >
    <dt className="w-full sm:w-1/3 text-slate-500 font-semibold uppercase tracking-tight text-[11px] py-0.5">
      {label}
    </dt>
    <dd
      className={clsx(
        "w-full sm:w-2/3 text-slate-900 leading-relaxed break-words",
        isBold && "font-bold tracking-tight",
      )}
    >
      {value || "Not Available"}
    </dd>
  </div>
);
