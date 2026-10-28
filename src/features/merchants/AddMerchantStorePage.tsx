import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Check, AlertCircle, Info } from "lucide-react";
import { clsx } from "clsx";
import { api } from "../../lib/api/client";

type FormStep = "form" | "success";

interface StoreFormData {
  // 1. Store Information
  storeId: string;
  storeName: string;
  baseUrl: string;
  storeIp: string;
  txInitiatedIp: string;
  homePage: string;
  escrowDays: string;
  txProfile: string;
  defaultTimeDuration: string;
  allowMultiAttempt: string;
  androidPackageId: string;
  isoAppId: string;
  defaultVisaGw: string;
  defaultMasterCardGw: string;
  enableCustomerInvoice: string;
  vatNo: string;
  binReg: string;
  tinReg: string;
  customerText: string;
  riskAlert: string;
  preSelectedChannel: string;
  requiredAdditionData: string;
  emiStatus: string;
  autoEmiStartAmt: string;
  storeStatus: string;
  walletEnabled: string;
  distributorPayment: string;
  txSmsEnabled: string;
  regenerateSession: string;
  autoSettlement: string;
  fcommerceEnable: string;
  maxTransAmount: string;
  minTransAmount: string;
  // 2. Contact Information
  firstName: string;
  mailingAddress: string;
  email: string;
  mobile: string;
  riskAlertEmail: string;
  supportEmail: string;
  supportContact: string;
  // 3. Store Physical Location
  paymentType: string;
  friendlyName: string;
  city: string;
  geoLat: string;
  geoLng: string;
  // 4. Store Account
  bank: string;
  branchName: string;
  accountName: string;
  accountNumber: string;
  routingNumber: string;
  storeCategory: string;
  // 5. Settlement Information
  settlementStatus: string;
  settledSunday: string;
  settledMonday: string;
  settledTuesday: string;
  settledWednesday: string;
  settledThursday: string;
  // 6. Addition Parameters
  aliasA: string;
  aliasB: string;
  aliasC: string;
  aliasD: string;
  // 7. Gateway Configuration
  bracGw: string;
  bracMid: string;
  eblGw: string;
  mccCode: string;
  cityGwMid: string;
  minAmtCommonMid: string;
  ucblGw: string;
  ucblMid: string;
  mtblGwMid: string;
  dbblSubMid1: string;
  dbblSubMid2: string;
  dbblSslId: string;
  uPayMid: string;
  bkashNumber: string;
  nagadNumber: string;
  ghooriPackage: string;
  sslServiceEnable: string;
  // 8. Monitoring Info
  monitorNight12to2: string;
  monitorNight2to6: string;
  monitorMorning6to9: string;
  monitorDayEvening: string;
  notificationEmail: string;
  notificationPhone: string;
  monitoringStatus: string;
}

const initialData: StoreFormData = {
  storeId: "",
  storeName: "",
  baseUrl: "",
  storeIp: "",
  txInitiatedIp: "",
  homePage: "",
  escrowDays: "",
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
  requiredAdditionData: "Disable",
  emiStatus: "Disable",
  autoEmiStartAmt: "",
  storeStatus: "Active",
  walletEnabled: "NO",
  distributorPayment: "NO",
  txSmsEnabled: "NO",
  regenerateSession: "NO",
  autoSettlement: "NO",
  fcommerceEnable: "NO",
  maxTransAmount: "",
  minTransAmount: "",
  firstName: "",
  mailingAddress: "",
  email: "",
  mobile: "",
  riskAlertEmail: "",
  supportEmail: "",
  supportContact: "",
  paymentType: "Online & QR",
  friendlyName: "",
  city: "",
  geoLat: "",
  geoLng: "",
  bank: "",
  branchName: "",
  accountName: "",
  accountNumber: "",
  routingNumber: "",
  storeCategory: "",
  settlementStatus: "Disable",
  settledSunday: "Disable",
  settledMonday: "Disable",
  settledTuesday: "Disable",
  settledWednesday: "Disable",
  settledThursday: "Disable",
  aliasA: "",
  aliasB: "",
  aliasC: "",
  aliasD: "",
  bracGw: "",
  bracMid: "",
  eblGw: "",
  mccCode: "",
  cityGwMid: "",
  minAmtCommonMid: "",
  ucblGw: "",
  ucblMid: "",
  mtblGwMid: "",
  dbblSubMid1: "",
  dbblSubMid2: "",
  dbblSslId: "SSL-",
  uPayMid: "",
  bkashNumber: "",
  nagadNumber: "",
  ghooriPackage: "",
  sslServiceEnable: "NO",
  monitorNight12to2: "0",
  monitorNight2to6: "0",
  monitorMorning6to9: "0",
  monitorDayEvening: "0",
  notificationEmail: "",
  notificationPhone: "",
  monitoringStatus: "Disable",
};

// Options
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
const AUTO_SEL = [
  { label: "Auto Select", value: "Auto Select" },
  { label: "CityBank", value: "CityBank" },
  { label: "EBL", value: "EBL" },
];
const CUST_INV = [
  { label: "Enable", value: "Enable" },
  { label: "Disable", value: "Disable" },
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
const YES_NO = [
  { label: "NO", value: "NO" },
  { label: "YES", value: "YES" },
];
const EN_DIS = [
  { label: "Disable", value: "Disable" },
  { label: "Enable", value: "Enable" },
];
const SETTL_DAY = [
  { label: "Disable", value: "Disable" },
  { label: "Settlement is Enabled", value: "Enabled" },
];
const BANKS = [
  { label: "Select Bank", value: "" },
  { label: "City Bank", value: "City Bank" },
  { label: "Brac Bank", value: "Brac Bank" },
  { label: "Dutch Bangla Bank", value: "Dutch Bangla Bank" },
  { label: "Eastern Bank", value: "Eastern Bank" },
  { label: "HSBC", value: "HSBC" },
  { label: "Standard Chartered", value: "Standard Chartered" },
];
const STORE_CAT = [
  { label: "Select Category", value: "" },
  { label: "E-commerce", value: "ecommerce" },
  { label: "Retail", value: "retail" },
];
const ONE_SEL = [
  { label: "Select One", value: "" },
  { label: "Enable", value: "Enable" },
  { label: "Disable", value: "Disable" },
];
const MCC_CODES = [
  { label: "Select MCC", value: "" },
  { label: "7311 - Advertising services", value: "7311" },
  { label: "7211 - Airport limo service", value: "7211" },
  { label: "5411 - Grocery Stores", value: "5411" },
  { label: "5812 - Eating Places", value: "5812" },
];
const MONITORING_STATUS = [
  { label: "Disable Monitoring", value: "Disable" },
  { label: "Enable Monitoring", value: "Enable" },
];
const STORE_STATUS = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];

// ── SectionHeader — identical to AddMerchantPage ───────────────────────────
const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center gap-3 mb-6 pb-2 border-b border-slate-100">
    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
      {title}
    </h2>
  </div>
);

// ── FormField — identical pattern to AddMerchantPage ──────────────────────
const FormField = ({
  label,
  name,
  formData = {},
  handleChange,
  errors = {},
  type = "text",
  helper,
  options,
  multiline,
  disabled,
  placeholder,
  required,
}: any) => {
  const hasError = !!errors?.[name as keyof StoreFormData];
  const fieldValue = (formData?.[name as keyof StoreFormData] ?? "") as string;

  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>

      {type === "select" && options ? (
        <select
          name={name}
          value={fieldValue}
          onChange={handleChange}
          disabled={disabled}
          className={clsx(
            "w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500",
            hasError
              ? "border-rose-300 focus:ring-rose-500"
              : "border-slate-200",
          )}
        >
          {options.map((opt: any) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : multiline ? (
        <textarea
          name={name}
          value={fieldValue}
          onChange={handleChange}
          rows={3}
          disabled={disabled}
          className={clsx(
            "w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none disabled:bg-slate-50 disabled:text-slate-500",
            hasError
              ? "border-rose-300 focus:ring-rose-500"
              : "border-slate-200",
          )}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={fieldValue}
          onChange={handleChange}
          disabled={disabled}
          className={clsx(
            "w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500",
            hasError
              ? "border-rose-300 focus:ring-rose-500"
              : "border-slate-200",
          )}
          placeholder={
            placeholder || (disabled ? "" : `Enter ${label.toLowerCase()}`)
          }
        />
      )}

      {helper && (
        <p className="mt-1 text-[11px] text-slate-500 italic flex items-start gap-1 leading-normal">
          <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
          {helper}
        </p>
      )}
      {hasError && (
        <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1 font-medium">
          <AlertCircle className="w-3 h-3" />
          {errors[name as keyof StoreFormData]}
        </p>
      )}
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────
export default function AddMerchantStorePage() {
  const { merchantId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState<FormStep>("form");
  const [formData, setFormData] = useState<StoreFormData>(initialData);
  const [errors, setErrors] = useState<
    Partial<Record<keyof StoreFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: merchant } = useQuery({
    queryKey: ["merchant", merchantId],
    queryFn: () =>
      merchantId ? api.merchants.get(merchantId) : Promise.resolve(null),
    enabled: !!merchantId,
  });

  const merchantDisplayName = merchant
    ? `${merchant.storeId}live - ${merchant.name}`
    : "—";

  const backPath = merchantId
    ? `/merchants/stores/${merchantId}`
    : "/merchants";

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof StoreFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof StoreFormData, string>> = {};
    if (!formData.storeId.trim()) newErrors.storeId = "Store ID is required";
    if (!formData.storeName.trim())
      newErrors.storeName = "Store Name is required";
    if (!formData.defaultTimeDuration)
      newErrors.defaultTimeDuration = "Default Time Duration is required";
    if (!formData.allowMultiAttempt)
      newErrors.allowMultiAttempt = "Allow Multi-attempt is required";
    if (!formData.requiredAdditionData)
      newErrors.requiredAdditionData = "Required Addition Data is required";
    if (!formData.storeStatus)
      newErrors.storeStatus = "Store Status is required";
    if (!formData.firstName.trim())
      newErrors.firstName = "First Name is required";
    if (!formData.mobile.trim()) newErrors.mobile = "Mobile is required";
    if (!formData.bkashNumber)
      newErrors.bkashNumber = "Bkash Number is required";
    if (!formData.nagadNumber)
      newErrors.nagadNumber = "Nagad Number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 900));
      setStep("success");
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success state ──────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Store Created Successfully!
        </h1>
        <p className="text-slate-600 mb-8 max-w-md text-center">
          The store <b>{formData.storeName || formData.storeId}</b> has been
          registered and configured.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => navigate(backPath)}
            className="px-6 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            Back to Stores
          </button>
          <button
            onClick={() => {
              setFormData(initialData);
              setErrors({});
              setStep("form");
            }}
            className="px-6 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
          >
            Add Another Store
          </button>
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto space-y-6 pb-20">
      {/* Header (back link) — same as AddMerchantPage */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(backPath)}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Stores
        </button>
      </div>

      {/* Single white card wrapper — identical to AddMerchantPage */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Card title bar */}
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100">
          <h1 className="text-lg font-bold text-slate-900 leading-tight">
            Add New Store
          </h1>
          <p className="text-[11px] font-medium text-slate-500 mt-0.5">
            Fill in the store configuration details below.
          </p>
        </div>

        {/* Sections */}
        <div className="p-6 space-y-10">
          {/* 1. Store Information */}
          <div>
            <SectionHeader title="Store Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1">
              <div className="md:col-span-2 lg:col-span-3">
                <FormField
                  label="Merchant Name"
                  name="merchantName"
                  formData={{ merchantName: merchantDisplayName }}
                  errors={errors}
                  disabled
                />
              </div>

              <FormField
                label="Store ID"
                name="storeId"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                required
                helper="This is not changeable while it is saved. Without space or any special characters. live : will be added automatically with the Store ID"
              />
              <FormField
                label="Store Name"
                name="storeName"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                required
              />
              <FormField
                label="Base URL of Store"
                name="baseUrl"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                helper="This URL will be validated by SSLCOMMERZ for every transaction"
              />

              <div className="md:col-span-2 lg:col-span-3">
                <FormField
                  label="Store IP address"
                  name="storeIp"
                  formData={formData}
                  handleChange={handleChange}
                  errors={errors}
                  helper="This IP will be validated by SSLCOMMERZ for every refund and API query. Comma ',' separated accepted."
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <FormField
                  label="Transaction Initiated IP"
                  name="txInitiatedIp"
                  formData={formData}
                  handleChange={handleChange}
                  errors={errors}
                  helper="This IP will be validated by SSLCOMMERZ at the time of initiating the transaction. Comma ',' separated accepted."
                />
              </div>

              <FormField
                label="Home Page of Store (URL)"
                name="homePage"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
              <FormField
                label="ESCROW Enable Days"
                name="escrowDays"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="number"
              />
              <FormField
                label="Transaction Profile (TP)"
                name="txProfile"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={[{ label: "Select Store Profile", value: "" }]}
              />

              <FormField
                label="Default Time Duration"
                name="defaultTimeDuration"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={TIME_DUR}
                required
              />
              <FormField
                label="Allow Multi-Attempt"
                name="allowMultiAttempt"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={MULTI_ATT}
                required
              />
              <FormField
                label="Android Package Id"
                name="androidPackageId"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
              <FormField
                label="ISO App Id"
                name="isoAppId"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />

              <FormField
                label="Default VISA Gateway"
                name="defaultVisaGw"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={AUTO_SEL}
              />
              <FormField
                label="Default MASTERCARD Gateway"
                name="defaultMasterCardGw"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={AUTO_SEL}
              />
              <FormField
                label="Enable Customer Invoice"
                name="enableCustomerInvoice"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={CUST_INV}
              />

              <FormField
                label="VAT No"
                name="vatNo"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
              <FormField
                label="BIN Reg"
                name="binReg"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
              <FormField
                label="TIN Reg"
                name="tinReg"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />

              <div className="md:col-span-2 lg:col-span-3">
                <FormField
                  label="Enable Customer Text"
                  name="customerText"
                  formData={formData}
                  handleChange={handleChange}
                  errors={errors}
                  multiline
                  placeholder="To bold you may use /b & b/"
                  helper="To bold you may use /b & b/"
                />
              </div>

              <FormField
                label="Enable Risk/Suspicious Alert"
                name="riskAlert"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={RISK_ALERT}
              />
              <FormField
                label="Pre-Selected Channel"
                name="preSelectedChannel"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={PRE_CHAN}
                helper="Applied only for Web Version Only"
              />
              <FormField
                label="Required Addition Data"
                name="requiredAdditionData"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={REQ_ADD}
                required
                helper="Customer must required to Input Email Id, Mobile number and Name if enabled"
              />

              <FormField
                label="EMI Status"
                name="emiStatus"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={EMI_STATUS}
              />
              <FormField
                label="Auto EMI Start Amt"
                name="autoEmiStartAmt"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
              <FormField
                label="Store Status"
                name="storeStatus"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={STORE_STATUS}
                required
              />

              <FormField
                label="Wallet Enabled"
                name="walletEnabled"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={YES_NO}
              />
              <FormField
                label="Distributor Payment Allowed"
                name="distributorPayment"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={YES_NO}
              />
              <FormField
                label="Transaction SMS Enabled"
                name="txSmsEnabled"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={YES_NO}
              />

              <FormField
                label="Regenerate Session Enabled"
                name="regenerateSession"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={YES_NO}
              />
              <FormField
                label="Auto Settlement Enabled"
                name="autoSettlement"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={YES_NO}
              />
              <FormField
                label="Fcommerce Enable"
                name="fcommerceEnable"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={YES_NO}
              />

              <FormField
                label="Max Trans Amount"
                name="maxTransAmount"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="number"
                helper="Min and Max amount must be declared."
              />
              <FormField
                label="Min Trans Amount"
                name="minTransAmount"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="number"
                helper="Min and Max amount must be declared."
              />
            </div>
          </div>

          {/* 2. Contact Information */}
          <div>
            <SectionHeader title="Contact Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1">
              <FormField
                label="First Name"
                name="firstName"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                required
              />
              <div className="md:col-span-2 lg:col-span-3">
                <FormField
                  label="Mailing Address"
                  name="mailingAddress"
                  formData={formData}
                  handleChange={handleChange}
                  errors={errors}
                  multiline
                />
              </div>
              <FormField
                label="Email"
                name="email"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="email"
              />
              <FormField
                label="Mobile"
                name="mobile"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="tel"
                required
              />
              <FormField
                label="Email for Risk Alert"
                name="riskAlertEmail"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="email"
              />
              <FormField
                label="Support Email Id"
                name="supportEmail"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="email"
              />
              <FormField
                label="Support Contact Number"
                name="supportContact"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="tel"
              />
            </div>
          </div>

          {/* 3. Store Physical Location */}
          <div>
            <SectionHeader title="Store Physical Location" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1">
              <FormField
                label="Payment Type"
                name="paymentType"
                formData={formData}
                errors={errors}
                disabled
                helper="Store Category is not changeable."
              />
              <div className="md:col-span-2 lg:col-span-3">
                <FormField
                  label="Friendly Name"
                  name="friendlyName"
                  formData={formData}
                  handleChange={handleChange}
                  errors={errors}
                  helper="If you input, then this name will be displayed in gateway page and customer payment invoice. And Merchant address and city will be replaced by store address and city."
                />
              </div>
              <FormField
                label="City"
                name="city"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
              <FormField
                label="GEO Latitude"
                name="geoLat"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="number"
              />
              <FormField
                label="GEO Longitude"
                name="geoLng"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="number"
              />
            </div>
          </div>

          {/* 4. Store Account */}
          <div>
            <SectionHeader title="Store Account" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1">
              <FormField
                label="Bank"
                name="bank"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={BANKS}
                helper="Once it is set, it can not be changed"
              />
              <FormField
                label="Branch Name"
                name="branchName"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                helper="Once it is set, it can not be changed"
              />
              <FormField
                label="Account Name"
                name="accountName"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                helper="Once it is set, it can not be changed"
              />
              <FormField
                label="Account Number"
                name="accountNumber"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                helper="Once it is set, it can not be changed"
              />
              <FormField
                label="Routing Number"
                name="routingNumber"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                helper="Once it is set, it can not be changed"
              />
              <FormField
                label="Store Category"
                name="storeCategory"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={STORE_CAT}
              />
            </div>
          </div>

          {/* 5. Settlement Information */}
          <div>
            <SectionHeader title="Settlement Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1">
              <FormField
                label="Settlement Status"
                name="settlementStatus"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={EN_DIS}
              />
              <FormField
                label="Settled on Sunday"
                name="settledSunday"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={SETTL_DAY}
              />
              <FormField
                label="Settled on Monday"
                name="settledMonday"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={SETTL_DAY}
              />
              <FormField
                label="Settled on Tuesday"
                name="settledTuesday"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={SETTL_DAY}
              />
              <FormField
                label="Settled on Wednesday"
                name="settledWednesday"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={SETTL_DAY}
              />
              <FormField
                label="Settled on Thursday"
                name="settledThursday"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={SETTL_DAY}
              />
            </div>
          </div>

          {/* 6. Addition Parameters */}
          <div>
            <SectionHeader title="Addition Parameters" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1">
              <FormField
                label="Alias of value_a"
                name="aliasA"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
              <FormField
                label="Alias of value_b"
                name="aliasB"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
              <FormField
                label="Alias of value_c"
                name="aliasC"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
              <FormField
                label="Alias of value_d"
                name="aliasD"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
            </div>
          </div>

          {/* 7. Gateway Configuration */}
          <div>
            <SectionHeader title="Gateway Configuration" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1">
              <FormField
                label="BRAC GW (Default)"
                name="bracGw"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={ONE_SEL}
              />
              <FormField
                label="BRAC MID"
                name="bracMid"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
              <FormField
                label="EBL GW (Default)"
                name="eblGw"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={ONE_SEL}
              />
              <FormField
                label="MCC Code"
                name="mccCode"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={MCC_CODES}
                helper="Once the MCC code is selected, then it is unchangeable."
              />
              <FormField
                label="City Gateway MID"
                name="cityGwMid"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                helper="Once the City Gateway has been configured, then it is unchangeable."
              />
              <FormField
                label="Min Amt for Common MID"
                name="minAmtCommonMid"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
              <FormField
                label="UCBL GW (Default)"
                name="ucblGw"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={ONE_SEL}
              />
              <FormField
                label="UCBL MID"
                name="ucblMid"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                helper="Once the UCBL Gateway has been configured, then it is unchangeable."
              />
              <FormField
                label="MTBL GW MID"
                name="mtblGwMid"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                helper="Once the MTBL Gateway has been configured, then it is unchangeable."
              />
              <FormField
                label="DBBL Sub MID (Sub-merchant)"
                name="dbblSubMid1"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                helper="Once the DBBL Sub-merchant has been configured, then it is unchangeable."
              />
              <FormField
                label="DBBL Sub MID (Terminal ID)"
                name="dbblSubMid2"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                helper="Once the DBBL Terminal ID has been configured, then it is unchangeable."
              />
              <FormField
                label="DBBL SSL ID"
                name="dbblSslId"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                helper="Once the DBBL SSL ID has been configured, then it is unchangeable."
              />
              <FormField
                label="UPay MID"
                name="uPayMid"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                placeholder="Format Must BE: Merchant ID (MID)|KEY"
                helper="Format Must BE: Merchant ID (MID)|KEY"
              />
              <FormField
                label="Bkash Number"
                name="bkashNumber"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={ONE_SEL}
                required
              />
              <FormField
                label="Nagad Number"
                name="nagadNumber"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={ONE_SEL}
                required
              />
              <FormField
                label="Ghoori Package Name"
                name="ghooriPackage"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
              <FormField
                label="SSL Service Enable"
                name="sslServiceEnable"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={YES_NO}
              />
            </div>
          </div>

          {/* 8. Monitoring Info */}
          <div>
            <SectionHeader title="Monitoring Info" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1">
              <FormField
                label="Night (12AM-2AM)"
                name="monitorNight12to2"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="number"
                helper="Mention the MAX minute gap. If zero, not monitored in this period."
              />
              <FormField
                label="Night (02AM-6AM)"
                name="monitorNight2to6"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="number"
                helper="Mention the MAX minute gap. If zero, not monitored in this period."
              />
              <FormField
                label="Morning (06AM-09AM)"
                name="monitorMorning6to9"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="number"
                helper="Mention the MAX minute gap. If zero, not monitored in this period."
              />
              <FormField
                label="Day & Evening (09AM-12AM)"
                name="monitorDayEvening"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="number"
                helper="Mention the MAX minute gap. If zero, not monitored in this period."
              />
              <FormField
                label="Notification Email"
                name="notificationEmail"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                placeholder="You can mention by comma"
                helper="You can mention by comma ',' separation"
              />
              <FormField
                label="Notification Phone"
                name="notificationPhone"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
              <FormField
                label="Monitoring Status"
                name="monitoringStatus"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={MONITORING_STATUS}
              />
            </div>
          </div>
        </div>

        {/* Footer Action — same as AddMerchantPage */}
        <div className="px-6 py-6 border-t border-slate-100 bg-slate-50/30">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-all shadow-md flex items-center gap-2 disabled:opacity-70"
          >
            {isSubmitting && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
