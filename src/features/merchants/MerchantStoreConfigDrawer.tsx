import React, { useEffect, useState } from "react";
import { AlertCircle, Settings2 } from "lucide-react";
import { clsx } from "clsx";
import { Drawer } from "../../components/Drawer";
import type { MerchantStore } from "../../data/mock/types";

const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center gap-3 mb-4 pb-2 border-b border-slate-100">
    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
      {title}
    </h2>
  </div>
);

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
          {!options.some((o) => o.value === "") && (
            <option value="">{placeholder || `Select ${label}`}</option>
          )}
          {options.map((o) => (
            <option key={o.value || o.label} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder || (disabled ? "" : "Enter...")}
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

const PAYMENT_METHODS = [
  { label: "CITYBANK", value: "CITYBANK" },
  { label: "EBL", value: "EBL" },
  { label: "BRAC", value: "BRAC" },
  { label: "DBBL", value: "DBBL" },
  { label: "CFTN", value: "CFTN" },
];

const SETTLEMENT_TYPES = [
  { label: "Net Settlement", value: "Net Settlement" },
  { label: "Non Settlement", value: "Non Settlement" },
  { label: "Gross Settlement", value: "Gross Settlement" },
];

const SETTLEMENT_CHARS = [
  { label: "Normal Settlement", value: "Normal Settlement" },
  { label: "Special Settlement", value: "Special Settlement" },
];

const MCC_CODES = [
  { label: "7311 - Advertising services", value: "7311" },
  { label: "7211 Airport limo service", value: "7211" },
  { label: "5411 - Grocery Stores", value: "5411" },
  { label: "5812 - Eating Places", value: "5812" },
];

const EMI_STATUS = [
  { label: "Enable (Up to 12M)", value: "Enable (Up to 12M)" },
  { label: "Enable (Up to 18M)", value: "Enable (Up to 18M)" },
  { label: "Disable", value: "Disable" },
];

const DIRECT_CARD = [
  { label: "EasyCheckout Integration", value: "EasyCheckout Integration" },
  { label: "Hosted Integration", value: "Hosted Integration" },
  { label: "Disable", value: "Disable" },
];

const GW_CURRENCY = [
  { label: "BDT", value: "BDT" },
  { label: "USD", value: "USD" },
  { label: "EUR", value: "EUR" },
];

const WHO_CARRY_TDR = [
  { label: "Merchant carry the TDR", value: "Merchant carry the TDR" },
  { label: "Customer carry the TDR", value: "Customer carry the TDR" },
];

const VERIFY_3D = [
  { label: "Allow All Transaction", value: "Allow All Transaction" },
  { label: "Allow only 3D Secure", value: "Allow only 3D Secure" },
  { label: "Disable", value: "Disable" },
];

const ISSUER_FLAG = [
  {
    label: "Allow only Local Issuer Card Transaction",
    value: "Allow only Local Issuer Card Transaction",
  },
  {
    label: "Allow any Local/Issuer Card Transaction",
    value: "Allow any Local/Issuer Card Transaction",
  },
  {
    label: "Allow only Foreign Issuer Card Transaction",
    value: "Allow only Foreign Issuer Card Transaction",
  },
];

const PROMO_STATUS = [
  { label: "Enable", value: "Enable" },
  { label: "Disable", value: "Disable" },
];

const MARKUP_TDR = [
  {
    label:
      "Disabled - Convenience Fee will be added per Markup TDR configured.",
    value:
      "Disabled - Convenience Fee will be added per Markup TDR configured.",
  },
  {
    label: "Enabled - Convenience Fee will be added per Markup TDR configured.",
    value: "Enabled - Convenience Fee will be added per Markup TDR configured.",
  },
];

const MARKUP_EMI = [
  {
    label:
      "Disabled - EMI charge fee will be added per Markup EMI rate configured.",
    value:
      "Disabled - EMI charge fee will be added per Markup EMI rate configured.",
  },
  {
    label:
      "Enabled - EMI charge fee will be added per Markup EMI rate configured.",
    value:
      "Enabled - EMI charge fee will be added per Markup EMI rate configured.",
  },
];

const RECURRING = [
  {
    label: "Disabled - Recurring Transaction Request",
    value: "Disabled - Recurring Transaction Request",
  },
  {
    label: "Enabled - Recurring Transaction Request",
    value: "Enabled - Recurring Transaction Request",
  },
];

const DISBURSEMENT = [
  {
    label: "Disabled - Settlement to Merchant Single Account",
    value: "Disabled - Settlement to Merchant Single Account",
  },
  {
    label: "Enabled - Settlement to Merchant Single Account",
    value: "Enabled - Settlement to Merchant Single Account",
  },
];

const SMS_ALERT = [
  {
    label: "Disabled - Merchant Payment Notification by SMS",
    value: "Disabled - Merchant Payment Notification by SMS",
  },
  {
    label: "Enabled - Merchant Payment Notification by SMS",
    value: "Enabled - Merchant Payment Notification by SMS",
  },
];

const EN_DIS = [
  { label: "Enable", value: "Enable" },
  { label: "Disable", value: "Disable" },
  { label: "Disabled", value: "Disabled" },
];

const RESELLERS = [
  { label: "Select Reseller", value: "" },
  { label: "SSL Partner One", value: "SSL Partner One" },
  { label: "Digital Hub BD", value: "Digital Hub BD" },
];

function buildDefaultForm(
  store: MerchantStore,
  merchantName?: string,
): Record<string, string> {
  const seed = store.storeId.replace(/\W/g, "").slice(-6) || "000000";
  return {
    merchantName: merchantName
      ? `${merchantName} - ${store.storeId}`
      : store.storeName,
    storeName: store.storeName,
    storePassword: `${seed.toUpperCase()}${store.id.padStart(4, "0")}`.slice(
      0,
      18,
    ),
    accountPayee: store.storeName.split(" ")[0]?.toUpperCase() || "SSLCOMMERZ",
    bankName: "",
    branchName: "",
    accountNo: "",
    routeNumber: "",
    paymentMethod: "CITYBANK",
    settlementType: "Net Settlement",
    settlementCharacter: "Normal Settlement",
    cardSaltKey: "",
    mccCode: "7311",
    merchantReferenceNo: "",
    eblId: "",
    eblGwId: "",
    cityId: "",
    bracId: "",
    bracMerchantName: "",
    upayId: "",
    bkashWallet: "01318081516",
    nagadWallet: "01318081516",
    dbblSubMerchantId: "000180801034049",
    dbblSubTerminalId: "3V123769",
    seblId: "mtp-pg-base/156LDR/CK-4286cc1bf2d60d3d5f371037f3942a",
    ucblMid:
      "cyber-source|156LDR/CK-4286cc1bf2d60d3d5f371037f3942a|baca91df-b4a5-42d4-a15d-251f93f64c12|ssl-bd|73e167c-2ed0-42f1-bd6b-43956f4d36e2|ssl-bd-demo",
    mtblGwMid: "",
    emiStatus:
      store.emiStatus === "EMI Enabled" ? "Enable (Up to 12M)" : "Disable",
    directCard: "EasyCheckout Integration",
    middleTierCommission: "",
    gwCurrency: store.currency || "BDT",
    whoCarryTdr: "Merchant carry the TDR",
    percentageOfTdrCarried: "0",
    reseller: "",
    motoMaxTransAmount: "0.00",
    motoMaxTraxPerDay: "0",
    motoMaxTraxPerMonth: "0",
    verify3dFlag: "Allow All Transaction",
    cardIssuerFlag: "Allow only Local Issuer Card Transaction",
    promotionalStatus: "Disable",
    isMarkupTdr:
      "Disabled - Convenience Fee will be added per Markup TDR configured.",
    isMarkupEmi:
      "Disabled - EMI charge fee will be added per Markup EMI rate configured.",
    recurring: "Disabled - Recurring Transaction Request",
    disbursementApi: "Disabled - Settlement to Merchant Single Account",
    merchantSmsAlert: "Disabled - Merchant Payment Notification by SMS",
    storeBasedCard: "Disabled",
    googlePayEnable: "Disabled",
    googlePayAcquire: "",
    googlePayMerchantId: "",
  };
}

interface Props {
  store: MerchantStore | null;
  onClose: () => void;
  merchantName?: string;
}

export function MerchantStoreConfigDrawer({
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
      setForm(buildDefaultForm(store, merchantName));
      setErrors({});
      setIsSuccess(false);
      setIsSubmitting(false);
    }
  }, [store, merchantName]);

  if (!store) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.storeName) next.storeName = "Store Name is required";
    if (!form.paymentMethod) next.paymentMethod = "Payment Method is required";
    if (!form.settlementType)
      next.settlementType = "Settlement Type is required";
    if (!form.settlementCharacter)
      next.settlementCharacter = "Settlement Character is required";
    if (!form.emiStatus) next.emiStatus = "EMI Status is required";
    if (!form.directCard) next.directCard = "Direct Card is required";
    setErrors(next);
    return Object.keys(next).length === 0;
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
      <div className="text-xl font-bold text-slate-900">Config Store</div>
      <div className="text-sm text-slate-500 font-normal flex items-center gap-2 mt-1">
        <Settings2 className="w-3.5 h-3.5 text-slate-400" />
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
              <Settings2 className="w-9 h-9 text-emerald-500" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">
                Store Configured Successfully!
              </h4>
              <p className="text-sm text-slate-500 mt-1">
                Configuration for{" "}
                <span className="font-mono font-semibold text-slate-700">
                  {store.storeName}
                </span>{" "}
                has been saved.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <section>
              <SectionHeader title="Store Information" />
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <div className="md:col-span-2">
                    <FormField
                      label="Merchant Name"
                      name="merchantName"
                      value={f("merchantName")}
                      disabled
                    />
                  </div>
                  <FormField
                    label="Store Name"
                    name="storeName"
                    value={f("storeName")}
                    onChange={handleChange}
                    required
                    errors={errors}
                  />
                  <FormField
                    label="Store Password"
                    name="storePassword"
                    value={f("storePassword")}
                    disabled
                  />
                  <FormField
                    label="Account Payee"
                    name="accountPayee"
                    value={f("accountPayee")}
                    onChange={handleChange}
                  />
                  <FormField
                    label="Bank Name"
                    name="bankName"
                    value={f("bankName")}
                    onChange={handleChange}
                  />
                  <FormField
                    label="Branch Name"
                    name="branchName"
                    value={f("branchName")}
                    onChange={handleChange}
                  />
                  <FormField
                    label="Account No"
                    name="accountNo"
                    value={f("accountNo")}
                    onChange={handleChange}
                  />
                  <FormField
                    label="Route Number"
                    name="routeNumber"
                    value={f("routeNumber")}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </section>

            <section>
              <SectionHeader title="Settlement & Payment" />
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <FormField
                    label="Payment Method"
                    name="paymentMethod"
                    value={f("paymentMethod")}
                    onChange={handleChange}
                    type="select"
                    options={PAYMENT_METHODS}
                    required
                    errors={errors}
                  />
                  <FormField
                    label="Settlement Type"
                    name="settlementType"
                    value={f("settlementType")}
                    onChange={handleChange}
                    type="select"
                    options={SETTLEMENT_TYPES}
                    required
                    errors={errors}
                  />
                  <FormField
                    label="Settlement Character"
                    name="settlementCharacter"
                    value={f("settlementCharacter")}
                    onChange={handleChange}
                    type="select"
                    options={SETTLEMENT_CHARS}
                    required
                    errors={errors}
                  />
                  <FormField
                    label="CARD SALT KEY"
                    name="cardSaltKey"
                    value={f("cardSaltKey")}
                    onChange={handleChange}
                  />
                  <FormField
                    label="MCC Code"
                    name="mccCode"
                    value={f("mccCode")}
                    onChange={handleChange}
                    type="select"
                    options={MCC_CODES}
                  />
                  <FormField
                    label="Merchant Reference No"
                    name="merchantReferenceNo"
                    value={f("merchantReferenceNo")}
                    onChange={handleChange}
                    placeholder="For EBL/NBL this is necessary, For others : 0"
                    helper="For Upay M.ID is necessary, For others : 0"
                  />
                </div>
              </div>
            </section>

            <section>
              <SectionHeader title="Gateway Identifiers" />
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <FormField
                    label="EBL ID"
                    name="eblId"
                    value={f("eblId")}
                    onChange={handleChange}
                  />
                  <FormField
                    label="EBL GW ID"
                    name="eblGwId"
                    value={f("eblGwId")}
                    onChange={handleChange}
                  />
                  <FormField
                    label="City ID"
                    name="cityId"
                    value={f("cityId")}
                    onChange={handleChange}
                  />
                  <FormField
                    label="BRAC ID"
                    name="bracId"
                    value={f("bracId")}
                    onChange={handleChange}
                  />
                  <FormField
                    label="BRAC Merchant Name"
                    name="bracMerchantName"
                    value={f("bracMerchantName")}
                    onChange={handleChange}
                  />
                  <FormField
                    label="UPAY ID"
                    name="upayId"
                    value={f("upayId")}
                    onChange={handleChange}
                    placeholder="Format Must BE : Merchant ID : 09101E7"
                    helper="Format Must BE : Merchant ID : 09101E7"
                  />
                  <FormField
                    label="BKash Wallet"
                    name="bkashWallet"
                    value={f("bkashWallet")}
                    onChange={handleChange}
                  />
                  <FormField
                    label="Nagad Wallet"
                    name="nagadWallet"
                    value={f("nagadWallet")}
                    onChange={handleChange}
                  />
                  <FormField
                    label="DBBL Sub Merchant ID"
                    name="dbblSubMerchantId"
                    value={f("dbblSubMerchantId")}
                    onChange={handleChange}
                  />
                  <FormField
                    label="DBBL Sub Terminal ID"
                    name="dbblSubTerminalId"
                    value={f("dbblSubTerminalId")}
                    onChange={handleChange}
                  />
                  <div className="md:col-span-2">
                    <FormField
                      label="SEBL ID"
                      name="seblId"
                      value={f("seblId")}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <FormField
                      label="UCBL MID"
                      name="ucblMid"
                      value={f("ucblMid")}
                      onChange={handleChange}
                    />
                  </div>
                  <FormField
                    label="MTBL GW MID"
                    name="mtblGwMid"
                    value={f("mtblGwMid")}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </section>

            <section>
              <SectionHeader title="EMI & TDR" />
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <FormField
                    label="EMI Status"
                    name="emiStatus"
                    value={f("emiStatus")}
                    onChange={handleChange}
                    type="select"
                    options={EMI_STATUS}
                    required
                    errors={errors}
                  />
                  <FormField
                    label="Direct Card"
                    name="directCard"
                    value={f("directCard")}
                    onChange={handleChange}
                    type="select"
                    options={DIRECT_CARD}
                    required
                    errors={errors}
                  />
                  <FormField
                    label="Middle Tier Commission"
                    name="middleTierCommission"
                    value={f("middleTierCommission")}
                    onChange={handleChange}
                  />
                  <FormField
                    label="GW Currency"
                    name="gwCurrency"
                    value={f("gwCurrency")}
                    onChange={handleChange}
                    type="select"
                    options={GW_CURRENCY}
                  />
                  <FormField
                    label="Who Carry TDR"
                    name="whoCarryTdr"
                    value={f("whoCarryTdr")}
                    onChange={handleChange}
                    type="select"
                    options={WHO_CARRY_TDR}
                  />
                  <FormField
                    label="Percentage of TDR Carried"
                    name="percentageOfTdrCarried"
                    value={f("percentageOfTdrCarried")}
                    onChange={handleChange}
                    helper="This configuration is applicable only if the TDR carried by the customer. Default value 0 means 100% carried. The value must be 1-99 which will be carried by the customer."
                  />
                  <FormField
                    label="Reseller"
                    name="reseller"
                    value={f("reseller")}
                    onChange={handleChange}
                    type="select"
                    options={RESELLERS}
                    placeholder="Select Reseller"
                  />
                </div>
              </div>
            </section>

            <section>
              <SectionHeader title="MOTO Limits" />
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <FormField
                    label="MOTO MAX Trans Amount"
                    name="motoMaxTransAmount"
                    value={f("motoMaxTransAmount")}
                    onChange={handleChange}
                  />
                  <FormField
                    label="MOTO MAX Trax per Day"
                    name="motoMaxTraxPerDay"
                    value={f("motoMaxTraxPerDay")}
                    onChange={handleChange}
                  />
                  <FormField
                    label="MOTO MAX Trax per Month"
                    name="motoMaxTraxPerMonth"
                    value={f("motoMaxTraxPerMonth")}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </section>

            <section>
              <SectionHeader title="Transaction Flags" />
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <FormField
                    label="3D Verify Flag"
                    name="verify3dFlag"
                    value={f("verify3dFlag")}
                    onChange={handleChange}
                    type="select"
                    options={VERIFY_3D}
                  />
                  <FormField
                    label="Card Issuer Flag (Local/Foreign)"
                    name="cardIssuerFlag"
                    value={f("cardIssuerFlag")}
                    onChange={handleChange}
                    type="select"
                    options={ISSUER_FLAG}
                  />
                  <FormField
                    label="Promotional Status"
                    name="promotionalStatus"
                    value={f("promotionalStatus")}
                    onChange={handleChange}
                    type="select"
                    options={PROMO_STATUS}
                  />
                  <div className="md:col-span-2">
                    <FormField
                      label="Is Markup TDR"
                      name="isMarkupTdr"
                      value={f("isMarkupTdr")}
                      onChange={handleChange}
                      type="select"
                      options={MARKUP_TDR}
                      helper="This configuration is applicable only if the TDR carried by the customer."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <FormField
                      label="Is Markup EMI"
                      name="isMarkupEmi"
                      value={f("isMarkupEmi")}
                      onChange={handleChange}
                      type="select"
                      options={MARKUP_EMI}
                      helper="This configuration is applicable only if the TDR carried by the customer."
                    />
                  </div>
                  <FormField
                    label="Recurring"
                    name="recurring"
                    value={f("recurring")}
                    onChange={handleChange}
                    type="select"
                    options={RECURRING}
                  />
                  <FormField
                    label="Disbursement API"
                    name="disbursementApi"
                    value={f("disbursementApi")}
                    onChange={handleChange}
                    type="select"
                    options={DISBURSEMENT}
                  />
                  <FormField
                    label="Merchant SMS Alert"
                    name="merchantSmsAlert"
                    value={f("merchantSmsAlert")}
                    onChange={handleChange}
                    type="select"
                    options={SMS_ALERT}
                  />
                  <FormField
                    label="Store Based Card"
                    name="storeBasedCard"
                    value={f("storeBasedCard")}
                    onChange={handleChange}
                    type="select"
                    options={EN_DIS}
                  />
                </div>
              </div>
            </section>

            <section>
              <SectionHeader title="Google Pay" />
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <FormField
                    label="Google Pay Enable"
                    name="googlePayEnable"
                    value={f("googlePayEnable")}
                    onChange={handleChange}
                    type="select"
                    options={EN_DIS}
                  />
                  <FormField
                    label="Google Pay Acquire"
                    name="googlePayAcquire"
                    value={f("googlePayAcquire")}
                    onChange={handleChange}
                  />
                  <FormField
                    label="Google Pay Merchant ID"
                    name="googlePayMerchantId"
                    value={f("googlePayMerchantId")}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </section>

            <div className="pt-6 border-t border-slate-100 sticky bottom-0 bg-white shadow-[0_-10px_20px_-15px_rgba(0,0,0,0.1)] mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-all shadow-md flex items-center gap-2 disabled:opacity-70"
              >
                {isSubmitting && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {isSubmitting ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </form>
        )}
      </div>
    </Drawer>
  );
}
