import React, { useState, useEffect } from "react";
import { Drawer } from "../../components/Drawer";
import { AlertCircle, PenLine } from "lucide-react";
import type { MerchantStore } from "../../data/mock/types";
import { clsx } from "clsx";

const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center gap-3 mb-4 pb-2 border-b border-slate-100">
    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
      {title}
    </h2>
  </div>
);

// ── FormField — identical to ResellerDrawer / AddMerchantUserPage pattern ─────
const FormField = ({
  label,
  name,
  value,
  onChange,
  errors = {},
  type = "text",
  helper,
  options,
  disabled,
  placeholder,
  multiline,
  required,
}: {
  label: string;
  name: string;
  value?: string;
  onChange?: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  errors?: Record<string, string>;
  type?: string;
  helper?: string;
  options?: { label: string; value: string }[];
  disabled?: boolean;
  placeholder?: string;
  multiline?: boolean;
  required?: boolean;
}) => {
  const hasError = !!errors[name];

  const inputCls = clsx(
    "w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all",
    disabled ? "bg-slate-50 text-slate-500 cursor-not-allowed" : "bg-white",
    hasError ? "border-rose-300 focus:ring-rose-500" : "border-slate-200",
  );

  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
        {label}
      </label>

      {type === "select" && options ? (
        <select
          name={name}
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          className={inputCls}
        >
          <option value="">{placeholder || `Select ${label}`}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : multiline ? (
        <textarea
          name={name}
          value={value ?? ""}
          onChange={onChange}
          rows={2}
          disabled={disabled}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          className={clsx(inputCls, "resize-none")}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder || (disabled ? "" : `Enter...`)}
          className={inputCls}
          required={required}
        />
      )}

      {helper && (
        <p className="mt-1 text-[11px] text-slate-500 italic leading-normal">
          {helper}
        </p>
      )}
      {hasError && (
        <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1 font-medium">
          <AlertCircle className="w-3 h-3" />
          {errors[name]}
        </p>
      )}
    </div>
  );
};

// ─── Yes/No & Enable/Disable options ─────────────────────────────────────────
const YES_NO = [
  { label: "YES", value: "YES" },
  { label: "NO", value: "NO" },
];
const EN_DIS = [
  { label: "Enable", value: "Enable" },
  { label: "Disable", value: "Disable" },
];
const AUTO_SEL = [
  { label: "Auto Select", value: "Auto Select" },
  { label: "CityBank", value: "CityBank" },
  { label: "EBL", value: "EBL" },
];
const ONE_SEL = [
  { label: "Select One", value: "" },
  { label: "Enable", value: "Enable" },
  { label: "Disable", value: "Disable" },
];
const TIME_DUR = [
  { label: "5 Minute", value: "5" },
  { label: "10 Minute", value: "10" },
  { label: "15 Minute", value: "15" },
  { label: "30 Minute", value: "30" },
];
const MULTI_ATT = [
  { label: "Allow Multi-attempt", value: "Allow" },
  { label: "Not Allowed", value: "NotAllow" },
];
const RISK_ALERT = [
  { label: "Blocked by Suspicious Transaction", value: "Blocked" },
  { label: "Alert Only", value: "Alert" },
  { label: "None", value: "None" },
];
const PRE_CHAN = [
  { label: "Remove the Selection", value: "Remove" },
  { label: "Card", value: "Card" },
  { label: "Mobile Banking", value: "MFS" },
];
const REQ_ADD = [
  { label: "Enable", value: "Enable" },
  { label: "Disable", value: "Disable" },
];
const EMI_STATUS = [
  { label: "EMI Disable", value: "Disable" },
  { label: "EMI Enable", value: "Enable" },
];
const SETTL_DAY = [
  { label: "Settlement is Enabled", value: "Enabled" },
  { label: "Disable", value: "Disable" },
];
const STORE_CAT = [
  { label: "Select Category", value: "" },
  { label: "E-commerce", value: "ecommerce" },
  { label: "Retail", value: "retail" },
];
const CUST_INV = [
  { label: "Enable", value: "Enable" },
  { label: "Disable", value: "Disable" },
];

// ─────────────────────────────────────────────────────────────────────────────
interface Props {
  store: MerchantStore | null;
  onClose: () => void;
  merchantName?: string;
}

export function MerchantStoreEditDrawer({
  store,
  onClose,
  merchantName,
}: Props) {
  const [form, setForm] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (store) {
      setForm({
        storeId: store.storeId,
        storeName: store.storeName,
        baseUrl: store.baseUrl,
        storeIp: "",
        txInitiatedIp: "",
        homePage: `https://${store.baseUrl}/`,
        escrowDays: "0",
        txProfile: "",
        defaultTimeDuration: "5",
        allowMultiAttempt: "Allow",
        androidPackageId: "",
        isoAppId: "",
        defaultVisaGw: "Auto Select",
        defaultMasterCardGw: "Auto Select",
        enableCustomerInvoice: "Enable",
        vatNo: "",
        binReg: "",
        tinReg: "",
        customerText: "",
        riskAlert: "Blocked",
        preSelectedChannel: "Remove",
        requiredAdditionData: "Enable",
        emiStatus: "Disable",
        autoEmiStartAmt: "5000",
        storeStatus: store.status,
        walletEnabled: "NO",
        distributorPayment: "NO",
        txSmsEnabled: "YES",
        regenerateSession: "NO",
        autoSettlement: "NO",
        fcommerceEnable: "NO",
        maxTransAmount: "0.00",
        minTransAmount: "0.00",
        // Contact
        firstName: store.storeName,
        mailingAddress: "",
        email: `store@${store.baseUrl}`,
        mobile: "",
        riskAlertEmail: `store@${store.baseUrl}`,
        supportEmail: `store@${store.baseUrl}`,
        supportContact: "",
        // Physical location
        paymentType: store.paymentType,
        friendlyName: store.storeId.replace(/live$/, ""),
        city: "Dhaka",
        geoLat: "0.000000",
        geoLng: "0.000000",
        // Account
        bank: "CITY BANK LIMITED",
        branchName: "ROKEYA SARANI",
        accountName: store.storeName.toUpperCase(),
        accountNumber: "1503384222001",
        routingNumber: "225260991",
        storeCategory: "",
        // Settlement
        settlementStatus: "Disable",
        settledSunday: "Enabled",
        settledMonday: "Disable",
        settledTuesday: "Disable",
        settledWednesday: "Disable",
        settledThursday: "Disable",
        // Addition params
        aliasA: "",
        aliasB: "",
        aliasC: "",
        aliasD: "",
        // Gateway
        bracGw: "",
        bracMid: "",
        eblGw: "",
        mccCode:
          "6011-Automated Cash Disbursements - Customer Financial Institution",
        cityGwMid: "",
        minAmtCommonMid: "10000.00",
        ucblGw: "cybersource|200000000000276|...",
        ucblMid: "cybersource|200000000000276|...",
        mtblGwMid: "",
        dbblSubMid1: "000599000050439",
        dbblSubMid2: "59900439",
        dbblSslId: "SSL-SSLCOMMERZ",
        uPayMid: "",
        bkashNumber: "01880086536",
        nagadNumber: "01907486293",
        ghooriPackage: "",
        // Monitoring Info
        monitorNight12to2: "0",
        monitorNight2to6: "0",
        monitorMorning6to9: "0",
        monitorDayEvening: "0",
        notificationEmail: "",
        notificationPhone: "",
        monitoringStatus: "Disable",
      });
      setErrors({});
      setIsSuccess(false);
    }
  }, [store]);

  if (!store) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.storeName) newErrors.storeName = "Required";
    if (!form.defaultTimeDuration) newErrors.defaultTimeDuration = "Required";
    if (!form.firstName) newErrors.firstName = "Required";
    if (!form.mobile) newErrors.mobile = "Required";
    if (!form.storeStatus) newErrors.storeStatus = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setIsSubmitting(false);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1600);
  };

  const f = (k: string) => form[k] ?? "";

  const customTitle = (
    <div>
      <div className="text-xl font-bold text-slate-900">Edit Store</div>
      <div className="text-sm text-slate-500 font-normal flex items-center gap-2 mt-1">
        <PenLine className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-mono text-slate-400">{store.storeId}</span>
      </div>
    </div>
  );

  return (
    <Drawer open={!!store} onClose={onClose} title={customTitle} width="2xl">
      <div className="pb-28">
        {isSuccess ? (
          <div className="flex flex-col items-center text-center space-y-5 py-16">
            <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center">
              <PenLine className="w-9 h-9 text-emerald-500" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">
                Store Updated Successfully!
              </h4>
              <p className="text-sm text-slate-500 mt-1">
                Changes to{" "}
                <span className="font-mono font-semibold text-slate-700">
                  {store.storeName}
                </span>{" "}
                have been saved.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ╔══════════════════════════════════════╗ */}
            {/*  STORE INFORMATION                       */}
            {/* ╚══════════════════════════════════════╝ */}
            <section>
              <SectionHeader title="Store Information" />
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <div className="md:col-span-2">
                    <FormField
                      label="Merchant Name"
                      name="merchantName"
                      value={merchantName || store.storeName}
                      disabled
                    />
                  </div>
                  <FormField
                    label="Store ID"
                    name="storeId"
                    value={f("storeId")}
                    disabled
                    required
                  />
                  <FormField
                    label="Store Name"
                    name="storeName"
                    value={f("storeName")}
                    disabled
                    required
                    errors={errors}
                  />
                  <FormField
                    label="Base URL of Store"
                    name="baseUrl"
                    value={f("baseUrl")}
                    onChange={handleChange}
                    helper="This URL will be validated by SSLCOMMERZ for every transaction"
                  />
                  <div className="md:col-span-2">
                    <FormField
                      label="Store IP address"
                      name="storeIp"
                      value={f("storeIp")}
                      onChange={handleChange}
                      placeholder="This IP will be validated by SSLCOMMERZ for every refund and API query. Comma"
                      helper="This IP will be validated by SSLCOMMERZ for every refund and API query. Comma ',' separated accepted."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <FormField
                      label="Transaction Initiated IP"
                      name="txInitiatedIp"
                      value={f("txInitiatedIp")}
                      onChange={handleChange}
                      placeholder="This IP will be validated by SSLCOMMERZ at the time of initiating the transaction. Comma"
                      helper="This IP will be validated by SSLCOMMERZ at the time of initiating the transaction. Comma ',' separated accepted."
                    />
                  </div>
                  <FormField
                    label="Home Page of Store (URL)"
                    name="homePage"
                    value={f("homePage")}
                    onChange={handleChange}
                  />
                  <FormField
                    label="ESCROW Enable Days"
                    name="escrowDays"
                    value={f("escrowDays")}
                    onChange={handleChange}
                    type="number"
                  />
                  <FormField
                    label="Transaction Profile (TP)"
                    name="txProfile"
                    value={f("txProfile")}
                    onChange={handleChange}
                    type="select"
                    options={[{ label: "Select Store Profile", value: "" }]}
                    placeholder="Select Store Profile"
                  />
                  <FormField
                    label="Default Time Duration"
                    name="defaultTimeDuration"
                    value={f("defaultTimeDuration")}
                    onChange={handleChange}
                    type="select"
                    options={TIME_DUR}
                    required
                    errors={errors}
                  />
                  <FormField
                    label="Allow Multi-Attempt"
                    name="allowMultiAttempt"
                    value={f("allowMultiAttempt")}
                    onChange={handleChange}
                    type="select"
                    options={MULTI_ATT}
                    required
                    errors={errors}
                  />
                  <FormField
                    label="Android Package Id"
                    name="androidPackageId"
                    value={f("androidPackageId")}
                    onChange={handleChange}
                    placeholder="Enter..."
                  />
                  <FormField
                    label="ISO App Id"
                    name="isoAppId"
                    value={f("isoAppId")}
                    onChange={handleChange}
                    placeholder="Enter..."
                  />
                  <FormField
                    label="Default VISA Gateway"
                    name="defaultVisaGw"
                    value={f("defaultVisaGw")}
                    onChange={handleChange}
                    type="select"
                    options={AUTO_SEL}
                  />
                  <FormField
                    label="Default MASTERCARD Gateway"
                    name="defaultMasterCardGw"
                    value={f("defaultMasterCardGw")}
                    onChange={handleChange}
                    type="select"
                    options={AUTO_SEL}
                  />
                  <FormField
                    label="Enable Customer Invoice"
                    name="enableCustomerInvoice"
                    value={f("enableCustomerInvoice")}
                    onChange={handleChange}
                    type="select"
                    options={CUST_INV}
                  />
                  <FormField
                    label="VAT No"
                    name="vatNo"
                    value={f("vatNo")}
                    onChange={handleChange}
                    placeholder="Enter..."
                  />
                  <FormField
                    label="BIN Reg"
                    name="binReg"
                    value={f("binReg")}
                    onChange={handleChange}
                    placeholder="Enter..."
                  />
                  <FormField
                    label="TIN Reg"
                    name="tinReg"
                    value={f("tinReg")}
                    onChange={handleChange}
                    placeholder="Enter..."
                  />
                  <div className="md:col-span-2">
                    <FormField
                      label="Enable Customer Text"
                      name="customerText"
                      value={f("customerText")}
                      onChange={handleChange}
                      multiline
                      placeholder="To bold you may use /b & b/"
                      helper="To bold you may use /b & b/"
                    />
                  </div>
                  <FormField
                    label="Enable Risk/Suspicious Alert"
                    name="riskAlert"
                    value={f("riskAlert")}
                    onChange={handleChange}
                    type="select"
                    options={RISK_ALERT}
                  />
                  <FormField
                    label="Pre-Selected Channel"
                    name="preSelectedChannel"
                    value={f("preSelectedChannel")}
                    onChange={handleChange}
                    type="select"
                    options={PRE_CHAN}
                    helper="Applied only for Web Version Only"
                  />
                  <FormField
                    label="Required Addition Data"
                    name="requiredAdditionData"
                    value={f("requiredAdditionData")}
                    onChange={handleChange}
                    type="select"
                    options={REQ_ADD}
                    required
                    errors={errors}
                    helper="Customer must required to input Email Id, Mobile Number and Name if enabled"
                  />
                  <FormField
                    label="EMI Status"
                    name="emiStatus"
                    value={f("emiStatus")}
                    onChange={handleChange}
                    type="select"
                    options={EMI_STATUS}
                  />
                  <FormField
                    label="Auto EMI Start Amt"
                    name="autoEmiStartAmt"
                    value={f("autoEmiStartAmt")}
                    onChange={handleChange}
                  />
                  <FormField
                    label="Store Status"
                    name="storeStatus"
                    value={f("storeStatus")}
                    onChange={handleChange}
                    type="select"
                    options={[
                      { label: "Active", value: "Active" },
                      { label: "Inactive", value: "Inactive" },
                    ]}
                    required
                    errors={errors}
                  />
                  <FormField
                    label="Wallet Enabled"
                    name="walletEnabled"
                    value={f("walletEnabled")}
                    onChange={handleChange}
                    type="select"
                    options={YES_NO}
                  />
                  <FormField
                    label="Distributor Payment Allowed"
                    name="distributorPayment"
                    value={f("distributorPayment")}
                    onChange={handleChange}
                    type="select"
                    options={YES_NO}
                  />
                  <FormField
                    label="Transaction SMS Enabled"
                    name="txSmsEnabled"
                    value={f("txSmsEnabled")}
                    onChange={handleChange}
                    type="select"
                    options={YES_NO}
                  />
                  <FormField
                    label="Regenerate Session Enabled"
                    name="regenerateSession"
                    value={f("regenerateSession")}
                    onChange={handleChange}
                    type="select"
                    options={YES_NO}
                  />
                  <FormField
                    label="Auto Settlement Enabled"
                    name="autoSettlement"
                    value={f("autoSettlement")}
                    onChange={handleChange}
                    type="select"
                    options={YES_NO}
                  />
                  <FormField
                    label="Fcommerce Enable"
                    name="fcommerceEnable"
                    value={f("fcommerceEnable")}
                    onChange={handleChange}
                    type="select"
                    options={YES_NO}
                  />
                  <FormField
                    label="Max Trans Amount"
                    name="maxTransAmount"
                    value={f("maxTransAmount")}
                    onChange={handleChange}
                    type="number"
                    helper="Min and Max amount must be declared."
                  />
                  <FormField
                    label="Min Trans Amount"
                    name="minTransAmount"
                    value={f("minTransAmount")}
                    onChange={handleChange}
                    type="number"
                    helper="Min and Max amount must be declared."
                  />
                </div>
              </div>
            </section>

            {/* ╔══════════════════════════════════════╗ */}
            {/*  CONTACT INFORMATION                     */}
            {/* ╚══════════════════════════════════════╝ */}
            <section>
              <SectionHeader title="Contact Information" />
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <FormField
                    label="First Name"
                    name="firstName"
                    value={f("firstName")}
                    onChange={handleChange}
                    required
                    errors={errors}
                  />
                  <div className="md:col-span-2">
                    <FormField
                      label="Mailing Address"
                      name="mailingAddress"
                      value={f("mailingAddress")}
                      onChange={handleChange}
                      multiline
                    />
                  </div>
                  <FormField
                    label="Email"
                    name="email"
                    value={f("email")}
                    onChange={handleChange}
                    type="email"
                  />
                  <FormField
                    label="Mobile"
                    name="mobile"
                    value={f("mobile")}
                    onChange={handleChange}
                    type="tel"
                    required
                    errors={errors}
                  />
                  <FormField
                    label="Email for Risk Alert"
                    name="riskAlertEmail"
                    value={f("riskAlertEmail")}
                    onChange={handleChange}
                    type="email"
                  />
                  <FormField
                    label="Support Email Id"
                    name="supportEmail"
                    value={f("supportEmail")}
                    onChange={handleChange}
                    type="email"
                  />
                  <FormField
                    label="Support Contact Number"
                    name="supportContact"
                    value={f("supportContact")}
                    onChange={handleChange}
                    type="tel"
                  />
                </div>
              </div>
            </section>

            {/* ╔══════════════════════════════════════╗ */}
            {/*  STORE PHYSICAL LOCATION                 */}
            {/* ╚══════════════════════════════════════╝ */}
            <section>
              <SectionHeader title="Store Physical Location" />
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <FormField
                    label="Payment Type"
                    name="paymentType"
                    value={f("paymentType")}
                    disabled
                    helper="Store Category is not changeable."
                  />
                  <div className="md:col-span-2">
                    <FormField
                      label="Friendly Name"
                      name="friendlyName"
                      value={f("friendlyName")}
                      onChange={handleChange}
                      helper="If you input, then this name will be displayed in gateway page and customer payment invoice. And Merchant address and city will be replaced by store address and city."
                    />
                  </div>
                  <FormField
                    label="City"
                    name="city"
                    value={f("city")}
                    onChange={handleChange}
                  />
                  <FormField
                    label="GEO Latitude"
                    name="geoLat"
                    value={f("geoLat")}
                    onChange={handleChange}
                    type="number"
                  />
                  <FormField
                    label="GEO Longitude"
                    name="geoLng"
                    value={f("geoLng")}
                    onChange={handleChange}
                    type="number"
                  />
                </div>
              </div>
            </section>

            {/* ╔══════════════════════════════════════╗ */}
            {/*  STORE ACCOUNT                          */}
            {/* ╚══════════════════════════════════════╝ */}
            <section>
              <SectionHeader title="Store Account" />
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <FormField
                    label="Bank"
                    name="bank"
                    value={f("bank")}
                    disabled
                    helper="Once it is set, it can not be changed"
                  />
                  <FormField
                    label="Branch Name"
                    name="branchName"
                    value={f("branchName")}
                    disabled
                    helper="Once it is set, it can not be changed"
                  />
                  <FormField
                    label="Account Name"
                    name="accountName"
                    value={f("accountName")}
                    disabled
                    helper="Once it is set, it can not be changed"
                  />
                  <FormField
                    label="Account Number"
                    name="accountNumber"
                    value={f("accountNumber")}
                    disabled
                    helper="Once it is set, it can not be changed"
                  />
                  <FormField
                    label="Routing Number"
                    name="routingNumber"
                    value={f("routingNumber")}
                    disabled
                    helper="Once it is set, it can not be changed"
                  />
                  <FormField
                    label="Store Category"
                    name="storeCategory"
                    value={f("storeCategory")}
                    onChange={handleChange}
                    type="select"
                    options={STORE_CAT}
                  />
                </div>
              </div>
            </section>

            {/* ╔══════════════════════════════════════╗ */}
            {/*  SETTLEMENT INFORMATION                 */}
            {/* ╚══════════════════════════════════════╝ */}
            <section>
              <SectionHeader title="Settlement Information" />
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <FormField
                    label="Settlement Status"
                    name="settlementStatus"
                    value={f("settlementStatus")}
                    onChange={handleChange}
                    type="select"
                    options={EN_DIS}
                  />
                  <FormField
                    label="Settled on Sunday"
                    name="settledSunday"
                    value={f("settledSunday")}
                    onChange={handleChange}
                    type="select"
                    options={SETTL_DAY}
                  />
                  <FormField
                    label="Settled on Monday"
                    name="settledMonday"
                    value={f("settledMonday")}
                    onChange={handleChange}
                    type="select"
                    options={EN_DIS}
                  />
                  <FormField
                    label="Settled on Tuesday"
                    name="settledTuesday"
                    value={f("settledTuesday")}
                    onChange={handleChange}
                    type="select"
                    options={EN_DIS}
                  />
                  <FormField
                    label="Settled on Wednesday"
                    name="settledWednesday"
                    value={f("settledWednesday")}
                    onChange={handleChange}
                    type="select"
                    options={EN_DIS}
                  />
                  <FormField
                    label="Settled on Thursday"
                    name="settledThursday"
                    value={f("settledThursday")}
                    onChange={handleChange}
                    type="select"
                    options={EN_DIS}
                  />
                </div>
              </div>
            </section>

            {/* ╔══════════════════════════════════════╗ */}
            {/*  ADDITION PARAMETERS                    */}
            {/* ╚══════════════════════════════════════╝ */}
            <section>
              <SectionHeader title="Addition Parameters" />
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <FormField
                    label="Alias of value_a"
                    name="aliasA"
                    value={f("aliasA")}
                    onChange={handleChange}
                    placeholder="Enter..."
                  />
                  <FormField
                    label="Alias of value_b"
                    name="aliasB"
                    value={f("aliasB")}
                    onChange={handleChange}
                    placeholder="Enter..."
                  />
                  <FormField
                    label="Alias of value_c"
                    name="aliasC"
                    value={f("aliasC")}
                    onChange={handleChange}
                    placeholder="Enter..."
                  />
                  <FormField
                    label="Alias of value_d"
                    name="aliasD"
                    value={f("aliasD")}
                    onChange={handleChange}
                    placeholder="Enter..."
                  />
                </div>
              </div>
            </section>

            {/* ╔══════════════════════════════════════╗ */}
            {/*  GATEWAY CONFIGURATION                  */}
            {/* ╚══════════════════════════════════════╝ */}
            <section>
              <SectionHeader title="Gateway Configuration" />
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <FormField
                    label="BRAC GW (Default)"
                    name="bracGw"
                    value={f("bracGw")}
                    onChange={handleChange}
                    type="select"
                    options={ONE_SEL}
                  />
                  <FormField
                    label="BRAC MID"
                    name="bracMid"
                    value={f("bracMid")}
                    onChange={handleChange}
                    placeholder="Enter..."
                  />
                  <FormField
                    label="EBL GW (Default)"
                    name="eblGw"
                    value={f("eblGw")}
                    onChange={handleChange}
                    type="select"
                    options={ONE_SEL}
                  />
                  <FormField
                    label="MCC Code"
                    name="mccCode"
                    value={f("mccCode")}
                    disabled
                  />
                  <FormField
                    label="City Gateway MID"
                    name="cityGwMid"
                    value={f("cityGwMid")}
                    onChange={handleChange}
                    placeholder="Once the City Gateway has been configured, then it is unchangeable."
                    helper="Once the City Gateway has been configured, then it is unchangeable."
                  />
                  <FormField
                    label="Min Amt for Common MID"
                    name="minAmtCommonMid"
                    value={f("minAmtCommonMid")}
                    onChange={handleChange}
                  />
                  <FormField
                    label="UCBL GW (Default)"
                    name="ucblGw"
                    value={f("ucblGw")}
                    disabled
                  />
                  <div className="md:col-span-2">
                    <FormField
                      label="UCBL MID"
                      name="ucblMid"
                      value={f("ucblMid")}
                      disabled
                    />
                  </div>
                  <FormField
                    label="MTBL GW MID"
                    name="mtblGwMid"
                    value={f("mtblGwMid")}
                    onChange={handleChange}
                    placeholder="Once the MTBL Gateway has been configured, then it is unchangeable."
                    helper="Once the MTBL Gateway has been configured, then it is unchangeable."
                  />
                  <FormField
                    label="DBBL Sub MID"
                    name="dbblSubMid1"
                    value={f("dbblSubMid1")}
                    onChange={handleChange}
                  />
                  <FormField
                    label="DBBL Sub MID"
                    name="dbblSubMid2"
                    value={f("dbblSubMid2")}
                    onChange={handleChange}
                  />
                  <FormField
                    label="DBBL SSL ID"
                    name="dbblSslId"
                    value={f("dbblSslId")}
                    onChange={handleChange}
                  />
                  <FormField
                    label="UPay MID"
                    name="uPayMid"
                    value={f("uPayMid")}
                    onChange={handleChange}
                    placeholder="Format Must BE: Merchant ID (MID)|KEY"
                    helper="Format Must BE: Merchant ID (MID)|KEY"
                  />
                  <FormField
                    label="Bkash Number"
                    name="bkashNumber"
                    value={f("bkashNumber")}
                    onChange={handleChange}
                    type="select"
                    required
                    errors={errors}
                    options={[
                      {
                        label: `${f("bkashNumber")} (Ecommerce Gateway)`,
                        value: f("bkashNumber"),
                      },
                    ]}
                    helper={`Current Wallet Number - ${f("bkashNumber")}`}
                  />
                  <FormField
                    label="Nagad Number"
                    name="nagadNumber"
                    value={f("nagadNumber")}
                    onChange={handleChange}
                    type="select"
                    required
                    errors={errors}
                    options={[
                      {
                        label: `${f("nagadNumber")} (Ecommerce Gateway)`,
                        value: f("nagadNumber"),
                      },
                    ]}
                    helper={`Current Wallet Number - ${f("nagadNumber")}`}
                  />
                  <FormField
                    label="Ghoori Package Name"
                    name="ghooriPackage"
                    value={f("ghooriPackage")}
                    onChange={handleChange}
                    placeholder="Enter..."
                  />
                </div>
              </div>
            </section>

            {/* ╔══════════════════════════════════════╗ */}
            {/*  MONITORING INFO                         */}
            {/* ╚══════════════════════════════════════╝ */}
            <section>
              <SectionHeader title="Monitoring Info" />
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <FormField
                    label="Night (12AM-2AM)"
                    name="monitorNight12to2"
                    value={f("monitorNight12to2")}
                    onChange={handleChange}
                    type="number"
                    helper="(Mention the MAX minute gap and if the value is zero, then it will be not monitored on this period)"
                  />
                  <FormField
                    label="Night (02AM-6AM)"
                    name="monitorNight2to6"
                    value={f("monitorNight2to6")}
                    onChange={handleChange}
                    type="number"
                    helper="(Mention the MAX minute gap and if the value is zero, then it will be not monitored on this period)"
                  />
                  <FormField
                    label="Monrning (06AM-09AM)"
                    name="monitorMorning6to9"
                    value={f("monitorMorning6to9")}
                    onChange={handleChange}
                    type="number"
                    helper="(Mention the MAX minute gap and if the value is zero, then it will be not monitored on this period)"
                  />
                  <FormField
                    label="Day & Evening (09AM-12AM)"
                    name="monitorDayEvening"
                    value={f("monitorDayEvening")}
                    onChange={handleChange}
                    type="number"
                    helper="(Mention the MAX minute gap and if the value is zero, then it will be not monitored on this period)"
                  />
                  <FormField
                    label="Notification Email"
                    name="notificationEmail"
                    value={f("notificationEmail")}
                    onChange={handleChange}
                    placeholder="You can mention by comma"
                    helper="You can mention by comma ',' separation"
                  />
                  <FormField
                    label="Notification Phone"
                    name="notificationPhone"
                    value={f("notificationPhone")}
                    onChange={handleChange}
                    placeholder="Enter..."
                  />
                  <FormField
                    label="Monitoring Status"
                    name="monitoringStatus"
                    value={f("monitoringStatus")}
                    onChange={handleChange}
                    type="select"
                    options={[
                      { label: "Enable Monitoring", value: "Enable" },
                      { label: "Disable Monitoring", value: "Disable" },
                    ]}
                  />
                </div>
              </div>
            </section>

            {/* ── Sticky footer ────────────────────────────────── */}
            <div className="pt-4 border-t border-slate-100 sticky bottom-0 bg-white shadow-[0_-10px_20px_-15px_rgba(0,0,0,0.1)]">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary-600 text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-primary-700 transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {isSubmitting ? "Saving..." : "Update Store"}
              </button>
            </div>
          </form>
        )}
      </div>
    </Drawer>
  );
}
