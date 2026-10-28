import { Drawer } from "../../components/Drawer";
import { Landmark } from "lucide-react";
import type { MerchantStore } from "../../data/mock/types";
import clsx from "clsx";

interface BankCommissionEntry {
  bank: string;
  cardType: string;
  bkComm: number;
  sslComm: number;
  total: number;
  enabled: boolean;
}

// ── Mock commission data derived from the screenshot ──────────────────────────
const COMMISSION_DATA: BankCommissionEntry[] = [
  {
    bank: "AB Bank",
    cardType: "ABBANKIB",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: true,
  },
  {
    bank: "AB Bank",
    cardType: "ABDIRECT",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: true,
  },
  {
    bank: "AB Bank",
    cardType: "CMA-ABBANK",
    bkComm: 0.4,
    sslComm: 2.1,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Arafah Islami Bank Limited",
    cardType: "AIBL",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: true,
  },
  {
    bank: "Arafah Islami Bank Limited",
    cardType: "CMA-AIBL",
    bkComm: 0.8,
    sslComm: 1.7,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "BANGLA QR PSO NPSB",
    cardType: "NPSB-MICRO",
    bkComm: 0.78,
    sslComm: 0.17,
    total: 0.95,
    enabled: false,
  },
  {
    bank: "BANGLA QR PSO NPSB",
    cardType: "NPSB-REGULR",
    bkComm: 0.82,
    sslComm: 0.33,
    total: 1.15,
    enabled: false,
  },
  {
    bank: "Bangladesh Commercial Bank Limited",
    cardType: "BCBL",
    bkComm: 1.25,
    sslComm: 1.25,
    total: 2.5,
    enabled: true,
  },
  {
    bank: "Bangladesh Development Bank Limited",
    cardType: "ACC",
    bkComm: 0.25,
    sslComm: 1.25,
    total: 1.5,
    enabled: false,
  },
  {
    bank: "Bangladesh Development Bank Limited",
    cardType: "BDBL",
    bkComm: 8,
    sslComm: 2,
    total: 10,
    enabled: false,
  },
  {
    bank: "Bangladesh Krishi Bank",
    cardType: "BKBIB",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Bank Asia Internet Banking",
    cardType: "BANKASIA",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: true,
  },
  {
    bank: "Bank Asia Limited",
    cardType: "ACC",
    bkComm: 0.3,
    sslComm: 1.2,
    total: 1.5,
    enabled: false,
  },
  {
    bank: "BKash",
    cardType: "BKASH",
    bkComm: 1.5,
    sslComm: 1,
    total: 2.5,
    enabled: true,
  },
  {
    bank: "Brac bank",
    cardType: "MASTER",
    bkComm: 1.7,
    sslComm: 0.8,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Brac bank",
    cardType: "VISA",
    bkComm: 1.7,
    sslComm: 0.8,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Brac bank",
    cardType: "WALLET",
    bkComm: 1.95,
    sslComm: 0.55,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "CashBaba",
    cardType: "ACC",
    bkComm: 0.4,
    sslComm: 1.1,
    total: 1.5,
    enabled: false,
  },
  {
    bank: "CashBaba",
    cardType: "CashBaba",
    bkComm: 1.1,
    sslComm: 1.4,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "CashBaba",
    cardType: "CMA-CASBABA",
    bkComm: 0.9,
    sslComm: 1.6,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "CashBaba",
    cardType: "CMA-RUPALI",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Citizens Bank PLC",
    cardType: "CITIZENS",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "City Bank",
    cardType: "AMEX",
    bkComm: 2.45,
    sslComm: 1.05,
    total: 3.5,
    enabled: false,
  },
  {
    bank: "City Bank",
    cardType: "CITYBANKIB",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "City Bank",
    cardType: "CMA-CITY",
    bkComm: 0.8,
    sslComm: 1.7,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "City Bank",
    cardType: "MASTER",
    bkComm: 1.95,
    sslComm: 0.55,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "City Bank",
    cardType: "TAKAPAY",
    bkComm: 1.7,
    sslComm: 0.8,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "City Bank",
    cardType: "UNIONPAY",
    bkComm: 1.95,
    sslComm: 0.55,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "City Bank",
    cardType: "VISA",
    bkComm: 1.95,
    sslComm: 0.55,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Commonapi-Banglalink",
    cardType: "BANGLALINK",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Dbbl Mobile Banking",
    cardType: "DBBLMOBILEB",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Dhaka Bank IB",
    cardType: "DHKBIB",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Dmoney",
    cardType: "Dmoney",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Dutch Bangla",
    cardType: "DBBLMOBILEB",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Dutch Bangla",
    cardType: "MASTER",
    bkComm: 2.2,
    sslComm: 0.3,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Dutch Bangla",
    cardType: "NEXUS",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Dutch Bangla",
    cardType: "ROCKET",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Dutch Bangla",
    cardType: "VISA",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Eastern Bank Limited",
    cardType: "DINERSCLUB",
    bkComm: 2.5,
    sslComm: 1,
    total: 3.5,
    enabled: false,
  },
  {
    bank: "Eastern Bank Limited",
    cardType: "MASTER",
    bkComm: 1.7,
    sslComm: 0.8,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Eastern Bank Limited",
    cardType: "SKYBANKING",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Eastern Bank Limited",
    cardType: "UNIONPAY",
    bkComm: 2.5,
    sslComm: 1,
    total: 3.5,
    enabled: false,
  },
  {
    bank: "Eastern Bank Limited",
    cardType: "VISA",
    bkComm: 1.7,
    sslComm: 0.8,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Easy Consumer Payment",
    cardType: "ACC",
    bkComm: 1.5,
    sslComm: 0,
    total: 1.5,
    enabled: false,
  },
  {
    bank: "Exim Bank",
    cardType: "EXIM",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "FSIBL",
    cardType: "CMA-FSIBL",
    bkComm: 0.7,
    sslComm: 1.8,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "FSIBL",
    cardType: "FSIBL",
    bkComm: 1.1,
    sslComm: 1.4,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "FSIBL QR PAY",
    cardType: "ACC",
    bkComm: 1.35,
    sslComm: 0.15,
    total: 1.5,
    enabled: false,
  },
  {
    bank: "Ghoori",
    cardType: "Ghoori",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "IFIC Bank Limited",
    cardType: "IFIC",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: true,
  },
  {
    bank: "iPay",
    cardType: "IPay",
    bkComm: 1.1,
    sslComm: 1.4,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Islami Bank",
    cardType: "CellFin",
    bkComm: 1,
    sslComm: 0.5,
    total: 1.5,
    enabled: false,
  },
  {
    bank: "Islami Bank",
    cardType: "CMA-CELLFIN",
    bkComm: 1.1,
    sslComm: 1.4,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Islami Bank",
    cardType: "IBBL",
    bkComm: 1.5,
    sslComm: 1,
    total: 2.5,
    enabled: true,
  },
  {
    bank: "ITCL",
    cardType: "QCASH",
    bkComm: 3,
    sslComm: 1,
    total: 4,
    enabled: false,
  },
  {
    bank: "ITCL",
    cardType: "VISA",
    bkComm: 3,
    sslComm: 1,
    total: 4,
    enabled: false,
  },
  {
    bank: "Jamuna Bank Limited",
    cardType: "JBL",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Mastercard MTBL",
    cardType: "MASTER",
    bkComm: 1.35,
    sslComm: 0.15,
    total: 1.5,
    enabled: false,
  },
  {
    bank: "Meghna Bank Limited",
    cardType: "MEGHNA",
    bkComm: 0.85,
    sslComm: 1.65,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Meghna Bank Limited",
    cardType: "MEGHNAPAY",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Meghna Bank Limited",
    cardType: "TAPNPAY",
    bkComm: 1.25,
    sslComm: 1.25,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Mercantile Bank Limited",
    cardType: "MYCASH",
    bkComm: 1.5,
    sslComm: 1,
    total: 2.5,
    enabled: true,
  },
  {
    bank: "Mercantile Bank Limited",
    cardType: "Rainbow",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "MIDLAND",
    cardType: "MIDLAND",
    bkComm: 1.1,
    sslComm: 1.4,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "MIDLAND QR PAY",
    cardType: "ACC",
    bkComm: 0.25,
    sslComm: 1.25,
    total: 1.5,
    enabled: false,
  },
  {
    bank: "Modhumoti Bank Limited",
    cardType: "MMBL",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Mutual Trust Bank Limited",
    cardType: "CMA-MTBL",
    bkComm: 0.7,
    sslComm: 1.8,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Mutual Trust Bank Limited",
    cardType: "MASTER",
    bkComm: 1.5,
    sslComm: 1,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Mutual Trust Bank Limited",
    cardType: "MTBL",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: true,
  },
  {
    bank: "Mutual Trust Bank Limited",
    cardType: "NPSB",
    bkComm: 0.4,
    sslComm: 1.1,
    total: 1.5,
    enabled: false,
  },
  {
    bank: "Mutual Trust Bank Limited",
    cardType: "VISA",
    bkComm: 1.5,
    sslComm: 1,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Nagad",
    cardType: "NAGAD",
    bkComm: 1.2,
    sslComm: 1.3,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "NCC Bank",
    cardType: "NCC",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "NRB Bank",
    cardType: "NRB",
    bkComm: 1,
    sslComm: 1,
    total: 2,
    enabled: false,
  },
  {
    bank: "NRB QR PAY",
    cardType: "ACC",
    bkComm: 1.35,
    sslComm: 0.15,
    total: 1.5,
    enabled: false,
  },
  {
    bank: "One Bank Limited",
    cardType: "ACC",
    bkComm: 0.2,
    sslComm: 1.3,
    total: 1.5,
    enabled: false,
  },
  {
    bank: "One Bank Limited",
    cardType: "Okwallet",
    bkComm: 0.8,
    sslComm: 1.7,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "PADMA QR PAY",
    cardType: "ACC",
    bkComm: 1.35,
    sslComm: 0.15,
    total: 1.5,
    enabled: false,
  },
  {
    bank: "Pathao",
    cardType: "PATHAOPAY",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Paywell",
    cardType: "PayWell",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Payza",
    cardType: "WALLET",
    bkComm: 2,
    sslComm: 1.5,
    total: 3.5,
    enabled: false,
  },
  {
    bank: "Pocket",
    cardType: "POCKET",
    bkComm: 0.9,
    sslComm: 1.6,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Premier Bank",
    cardType: "ACC",
    bkComm: 0.25,
    sslComm: 1.25,
    total: 1.5,
    enabled: false,
  },
  {
    bank: "Premier Bank",
    cardType: "MASTER",
    bkComm: 2,
    sslComm: 0.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Premier Bank",
    cardType: "NPSB-MICRO",
    bkComm: 0.78,
    sslComm: 0.17,
    total: 0.95,
    enabled: false,
  },
  {
    bank: "Premier Bank",
    cardType: "NPSB-REGULR",
    bkComm: 0.82,
    sslComm: 0.33,
    total: 1.15,
    enabled: false,
  },
  {
    bank: "Premier Bank",
    cardType: "ONUS-MICRO",
    bkComm: 0.48,
    sslComm: 0.47,
    total: 0.95,
    enabled: false,
  },
  {
    bank: "Premier Bank",
    cardType: "ONUS-REGULR",
    bkComm: 0.58,
    sslComm: 0.57,
    total: 1.15,
    enabled: false,
  },
  {
    bank: "Premier Bank",
    cardType: "PMONEY",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Premier Bank",
    cardType: "VISA",
    bkComm: 2,
    sslComm: 0.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "PREMIER QR PAY",
    cardType: "ACC",
    bkComm: 1.35,
    sslComm: 0.15,
    total: 1.5,
    enabled: false,
  },
  {
    bank: "Prime Bank Limited",
    cardType: "PBL",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Pubali Bank Ltd",
    cardType: "CMA-PUBALI",
    bkComm: 0.7,
    sslComm: 1.8,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Pubali Bank Ltd",
    cardType: "PUBALI",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "SBAC BANK",
    cardType: "ACC",
    bkComm: 1.35,
    sslComm: 0.15,
    total: 1.5,
    enabled: false,
  },
  {
    bank: "SBAC BANK",
    cardType: "SBAC",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Software Shop Limited",
    cardType: "BNPL",
    bkComm: 0,
    sslComm: 2.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Software Shop Limited",
    cardType: "PROMO",
    bkComm: 0,
    sslComm: 2.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Southeast Bank Limited",
    cardType: "InstaPay",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Southeast Bank Limited",
    cardType: "MASTER",
    bkComm: 1.9,
    sslComm: 0.6,
    total: 2.5,
    enabled: true,
  },
  {
    bank: "Southeast Bank Limited",
    cardType: "VISA",
    bkComm: 1.9,
    sslComm: 0.6,
    total: 2.5,
    enabled: true,
  },
  {
    bank: "SSL-Utility",
    cardType: "bKash",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "SSL-Utility",
    cardType: "CitytouchIV",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "SSL-Utility",
    cardType: "MTBLIV",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "SSL-Utility",
    cardType: "NAGAD",
    bkComm: 3,
    sslComm: -0.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "SSL-Utility",
    cardType: "SSLUTILITY",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "SSL-Utility",
    cardType: "Surecash",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "SSL-Utility",
    cardType: "TAP",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "State Bank of India",
    cardType: "SBI",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "STPAY",
    cardType: "STPAY",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "SureCash",
    cardType: "SureCash",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Trust Bank Limited",
    cardType: "ITCL",
    bkComm: 2,
    sslComm: 0.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Trust Bank Limited",
    cardType: "MobileMoney",
    bkComm: 0.9,
    sslComm: 1.6,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Trust Bank Limited",
    cardType: "TBLIB",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "UCB IB",
    cardType: "UCBIB",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "UnionPay",
    cardType: "UNIONPAY",
    bkComm: 0.5,
    sslComm: 1,
    total: 1.5,
    enabled: false,
  },
  {
    bank: "United Commercial Bank Ltd",
    cardType: "CMA-UPAY",
    bkComm: 1.3,
    sslComm: 0.7,
    total: 2,
    enabled: false,
  },
  {
    bank: "United Commercial Bank Ltd",
    cardType: "MASTER",
    bkComm: 1.5,
    sslComm: 1,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "United Commercial Bank Ltd",
    cardType: "UCash",
    bkComm: 21,
    sslComm: -18.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "United Commercial Bank Ltd",
    cardType: "UNET",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "United Commercial Bank Ltd",
    cardType: "UPay",
    bkComm: 1,
    sslComm: 1,
    total: 2,
    enabled: false,
  },
  {
    bank: "United Commercial Bank Ltd",
    cardType: "VISA",
    bkComm: 1.5,
    sslComm: 1,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "Visa Account Based Payment",
    cardType: "ABP",
    bkComm: 1,
    sslComm: 1.5,
    total: 2.5,
    enabled: false,
  },
  {
    bank: "VisaNet EBL",
    cardType: "VISA",
    bkComm: 1.35,
    sslComm: 0.15,
    total: 1.5,
    enabled: false,
  },
];

// ── Commission row component ───────────────────────────────────────────────────
function CommissionRow({ entry }: { entry: BankCommissionEntry }) {
  const commStr = `${entry.bkComm} + ${entry.sslComm} = `;
  return (
    <div
      className={clsx(
        "grid grid-cols-[2fr_1.5fr_2fr] px-4 py-2.5 border-b border-slate-100 last:border-0 text-sm",
        entry.enabled ? "bg-white" : "bg-slate-50/50",
      )}
    >
      <span
        className={clsx(
          entry.enabled ? "font-semibold text-slate-900" : "text-slate-400",
        )}
      >
        {entry.bank}
      </span>
      <span
        className={clsx(
          entry.enabled ? "font-semibold text-slate-800" : "text-slate-400",
        )}
      >
        {entry.cardType}
      </span>
      <span
        className={clsx(entry.enabled ? "text-slate-700" : "text-slate-400")}
      >
        {commStr}
        <span
          className={clsx(
            "font-bold",
            entry.enabled ? "text-slate-900" : "text-slate-400",
          )}
        >
          {entry.total} %
        </span>
      </span>
    </div>
  );
}

// ── Table header ──────────────────────────────────────────────────────────────
function TableHeader() {
  return (
    <div className="grid grid-cols-[2fr_1.5fr_2fr] px-4 py-3 bg-slate-50 border-b border-slate-200 rounded-t-lg">
      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
        Bank
      </span>
      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
        Card Type
      </span>
      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
        BK Comm. + SSL Comm. = Total
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
interface Props {
  store: MerchantStore | null;
  onClose: () => void;
}

export function MerchantStoreBankCommissionDrawer({ store, onClose }: Props) {
  if (!store) return null;

  const enabled = COMMISSION_DATA.filter((e) => e.enabled);
  const disabled = COMMISSION_DATA.filter((e) => !e.enabled);

  const customTitle = (
    <div>
      <div className="text-xl font-bold text-slate-900">Store Commission</div>
      <div className="text-sm text-slate-500 font-normal font-mono mt-1">
        {store.storeId}
      </div>
    </div>
  );

  return (
    <Drawer open={!!store} onClose={onClose} title={customTitle} width="3xl">
      <div className="space-y-8 pb-20">
        {/* ── Enabled section ──────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Enabled
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
              {enabled.length}
            </span>
          </div>
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <TableHeader />
            <div className="divide-y divide-slate-100">
              {enabled.map((entry, i) => (
                <CommissionRow key={i} entry={entry} />
              ))}
              {enabled.length === 0 && (
                <div className="px-4 py-6 text-sm text-slate-400 text-center">
                  No enabled entries.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Disabled section ─────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Disabled
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
              {disabled.length}
            </span>
          </div>
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <TableHeader />
            <div className="divide-y divide-slate-100">
              {disabled.map((entry, i) => (
                <CommissionRow key={i} entry={entry} />
              ))}
              {disabled.length === 0 && (
                <div className="px-4 py-6 text-sm text-slate-400 text-center">
                  No disabled entries.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </Drawer>
  );
}
