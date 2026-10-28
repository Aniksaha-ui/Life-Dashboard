import { clsx } from "clsx";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Download,
  FileText,
  Percent,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Handshake,
  Store,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  ClearAllFiltersButton,
  FilterBar,
  type FilterConfig,
} from "../../components/FilterBar";
import logoUsBangla from "../../assets/logos/logo_usbangla.png";
import logoGp from "../../assets/logos/logos_gp.png";

// --- Data Types ---

interface MerchantItem {
  name: string;
  code: string;
  storesCount: number;
}

interface WorkflowStep {
  step: number;
  title: string;
  sub: string;
  status: "completed" | "current" | "upcoming";
}

interface ActivityLogItem {
  id: string;
  timeFormatted: string;
  dateFormatted: string;
  activityType:
    | "Reseller Onboarding"
    | "Document Review"
    | "Commission"
    | "Store Configuration"
    | "Settlement";
  actorType: "KAM" | "OPS" | "Accounts" | "RA" | "Reseller";
  title: string;
  desc: string;
  entity: string;
  actor: string;
  status:
    | "Completed"
    | "Pending"
    | "Rejected"
    | "Approved"
    | "Submitted"
    | "Accepted"
    | "Awaiting Review"
    | "Created";
  statusType: "approved" | "waiting" | "info" | "rejected";
  iconType:
    | "dollar"
    | "check"
    | "document"
    | "commission"
    | "store"
    | "plus"
    | "refund";
}

interface ResellerHierarchyData {
  id: string;
  resellerId: string;
  name: string;
  initials: string;
  logo?: string;
  kam: string;
  status: "Active" | "Review" | "Pending" | "Rejected";
  type: string;
  addedBy: string;
  onboardingDate: string;
  currentStage: string;
  merchantsCount: number;
  storesCount: number;
  merchants: MerchantItem[];
  workflowSteps: WorkflowStep[];
  activities: ActivityLogItem[];
}

// --- Sample Data ---

const MOCK_RESELLERS: ResellerHierarchyData[] = [
  {
    id: "r1",
    resellerId: "RSL-000128",
    name: "ABC Distribution",
    initials: "AB",
    logo: logoUsBangla,
    kam: "Rahim Ahmed",
    status: "Active",
    type: "Distributor / Reseller",
    addedBy: "Rahim Ahmed",
    onboardingDate: "04 Aug 2026",
    currentStage: "Settlement Ready",
    merchantsCount: 3,
    storesCount: 16,
    merchants: [
      { name: "Fresh Mart Ltd.", code: "MRC-00281", storesCount: 8 },
      { name: "Daily Needs BD", code: "MRC-00294", storesCount: 5 },
      { name: "Urban Grocery", code: "MRC-00301", storesCount: 3 },
    ],
    workflowSteps: [
      { step: 1, title: "Reseller Added", sub: "04 Aug", status: "completed" },
      { step: 2, title: "Registration", sub: "05 Aug", status: "completed" },
      { step: 3, title: "Documents", sub: "06 Aug", status: "completed" },
      { step: 4, title: "Commission", sub: "07 Aug", status: "completed" },
      { step: 5, title: "Store SLB", sub: "08 Aug", status: "completed" },
      { step: 6, title: "RA Review", sub: "10 Aug", status: "completed" },
      { step: 7, title: "Settlement", sub: "In Progress", status: "current" },
    ],
    activities: [
      {
        id: "act-1",
        timeFormatted: "11:42 AM",
        dateFormatted: "14 Aug",
        activityType: "Settlement",
        actorType: "Accounts",
        title: "Settlement initiated",
        desc: "Settlement request created for 16 stores for the period 01 Aug - 13 Aug.",
        entity: "16 stores",
        actor: "By Accounts · Settlement #SET-00871",
        status: "Pending",
        statusType: "waiting",
        iconType: "dollar",
      },
      {
        id: "act-2",
        timeFormatted: "04:15 PM",
        dateFormatted: "13 Aug",
        activityType: "Settlement",
        actorType: "RA",
        title: "RA approved settlement review",
        desc: "Settlement request approved by RA Team.",
        entity: "RA Team",
        actor: "By Arif Hossain · RA",
        status: "Approved",
        statusType: "approved",
        iconType: "check",
      },
      {
        id: "act-3",
        timeFormatted: "11:20 AM",
        dateFormatted: "13 Aug",
        activityType: "Settlement",
        actorType: "Accounts",
        title: "Accounts requested RA review",
        desc: "Settlement package submitted to Revenue Assurance for validation.",
        entity: "Revenue Assurance",
        actor: "By Shafiq Ahmed · Accounts",
        status: "Submitted",
        statusType: "info",
        iconType: "refund",
      },
      {
        id: "act-4",
        timeFormatted: "03:42 PM",
        dateFormatted: "12 Aug",
        activityType: "Store Configuration",
        actorType: "KAM",
        title: "Store commission SLB configured",
        desc: "Commission slab applied to Fresh Mart Ltd. across 8 stores.",
        entity: "Fresh Mart Ltd.",
        actor: "By Rahim Ahmed · KAM",
        status: "Completed",
        statusType: "approved",
        iconType: "store",
      },
      {
        id: "act-5",
        timeFormatted: "02:18 PM",
        dateFormatted: "11 Aug",
        activityType: "Commission",
        actorType: "Reseller",
        title: "Commission configuration accepted",
        desc: "Reseller accepted commission configuration with settlement day Every 15th.",
        entity: "Every 15th",
        actor: "By ABC Distribution · Reseller",
        status: "Accepted",
        statusType: "approved",
        iconType: "check",
      },
      {
        id: "act-6",
        timeFormatted: "05:31 PM",
        dateFormatted: "10 Aug",
        activityType: "Commission",
        actorType: "KAM",
        title: "Commission configuration sent",
        desc: "KAM sent commission configuration for reseller review.",
        entity: "Reseller Review",
        actor: "By Rahim Ahmed · KAM",
        status: "Awaiting Review",
        statusType: "waiting",
        iconType: "commission",
      },
      {
        id: "act-7",
        timeFormatted: "12:10 PM",
        dateFormatted: "09 Aug",
        activityType: "Document Review",
        actorType: "OPS",
        title: "Documents approved",
        desc: "Trade License, BIN Certificate and Bank Document approved by OPS.",
        entity: "OPS Verification",
        actor: "By Nusrat Jahan · OPS",
        status: "Approved",
        statusType: "approved",
        iconType: "check",
      },
      {
        id: "act-8",
        timeFormatted: "10:34 AM",
        dateFormatted: "06 Aug",
        activityType: "Document Review",
        actorType: "Reseller",
        title: "Required documents uploaded",
        desc: "3 required documents uploaded by reseller for OPS verification.",
        entity: "3 documents",
        actor: "By ABC Distribution · Reseller",
        status: "Submitted",
        statusType: "info",
        iconType: "document",
      },
      {
        id: "act-9",
        timeFormatted: "03:20 PM",
        dateFormatted: "05 Aug",
        activityType: "Reseller Onboarding",
        actorType: "Reseller",
        title: "Reseller registration completed",
        desc: "Business information and contact information submitted successfully.",
        entity: "Business Information",
        actor: "By ABC Distribution · Reseller",
        status: "Completed",
        statusType: "approved",
        iconType: "check",
      },
      {
        id: "act-10",
        timeFormatted: "09:15 AM",
        dateFormatted: "04 Aug",
        activityType: "Reseller Onboarding",
        actorType: "KAM",
        title: "Reseller created",
        desc: "New reseller ABC Distribution was added to KAM portfolio.",
        entity: "ABC Distribution",
        actor: "By Rahim Ahmed · KAM",
        status: "Created",
        statusType: "info",
        iconType: "plus",
      },
    ],
  },
  {
    id: "r2",
    resellerId: "RSL-000119",
    name: "Global Trade BD",
    initials: "GT",
    logo: logoGp,
    kam: "Sumon Hossain",
    status: "Review",
    type: "Wholesale Partner",
    addedBy: "Sumon Hossain",
    onboardingDate: "01 Aug 2026",
    currentStage: "Document Verification",
    merchantsCount: 2,
    storesCount: 9,
    merchants: [
      { name: "TradeCorp Ltd.", code: "MRC-00210", storesCount: 5 },
      { name: "Global Retail", code: "MRC-00215", storesCount: 4 },
    ],
    workflowSteps: [
      { step: 1, title: "Reseller Added", sub: "01 Aug", status: "completed" },
      { step: 2, title: "Registration", sub: "02 Aug", status: "completed" },
      { step: 3, title: "Documents", sub: "In Progress", status: "current" },
      { step: 4, title: "Commission", sub: "Pending", status: "upcoming" },
      { step: 5, title: "Store SLB", sub: "Pending", status: "upcoming" },
      { step: 6, title: "RA Review", sub: "Pending", status: "upcoming" },
      { step: 7, title: "Settlement", sub: "Pending", status: "upcoming" },
    ],
    activities: [
      {
        id: "act-201",
        timeFormatted: "02:15 PM",
        dateFormatted: "12 Aug",
        activityType: "Document Review",
        actorType: "OPS",
        title: "Documents uploaded for review",
        desc: "TIN and NID copies uploaded for OPS verification.",
        entity: "TIN & NID",
        actor: "By Global Trade BD · Reseller",
        status: "Pending",
        statusType: "waiting",
        iconType: "document",
      },
      {
        id: "act-201b",
        timeFormatted: "04:30 PM",
        dateFormatted: "08 Aug",
        activityType: "Commission",
        actorType: "KAM",
        title: "Commission Slab configured",
        desc: "Proposed commission slab sent to Global Trade BD.",
        entity: "Commission Config",
        actor: "By Sumon Hossain · KAM",
        status: "Completed",
        statusType: "approved",
        iconType: "commission",
      },
      {
        id: "act-201c",
        timeFormatted: "10:15 AM",
        dateFormatted: "05 Aug",
        activityType: "Reseller Onboarding",
        actorType: "Reseller",
        title: "Registration details completed",
        desc: "Business profile and trade information verified.",
        entity: "Registration",
        actor: "By Global Trade BD · Reseller",
        status: "Completed",
        statusType: "approved",
        iconType: "check",
      },
      {
        id: "act-202",
        timeFormatted: "11:00 AM",
        dateFormatted: "01 Aug",
        activityType: "Reseller Onboarding",
        actorType: "KAM",
        title: "Reseller created",
        desc: "Reseller Global Trade BD registered.",
        entity: "Global Trade BD",
        actor: "By Sumon Hossain · KAM",
        status: "Created",
        statusType: "info",
        iconType: "plus",
      },
    ],
  },
  {
    id: "r3",
    resellerId: "RSL-000107",
    name: "Prime Commerce",
    initials: "PC",
    kam: "Tanvir Hasan",
    status: "Pending",
    type: "Retail Aggregator",
    addedBy: "Tanvir Hasan",
    onboardingDate: "28 Jul 2026",
    currentStage: "Awaiting Registration",
    merchantsCount: 1,
    storesCount: 4,
    merchants: [{ name: "Prime Retail", code: "MRC-00190", storesCount: 4 }],
    workflowSteps: [
      { step: 1, title: "Reseller Added", sub: "28 Jul", status: "completed" },
      { step: 2, title: "Registration", sub: "In Progress", status: "current" },
      { step: 3, title: "Documents", sub: "Pending", status: "upcoming" },
      { step: 4, title: "Commission", sub: "Pending", status: "upcoming" },
      { step: 5, title: "Store SLB", sub: "Pending", status: "upcoming" },
      { step: 6, title: "RA Review", sub: "Pending", status: "upcoming" },
      { step: 7, title: "Settlement", sub: "Pending", status: "upcoming" },
    ],
    activities: [
      {
        id: "act-301",
        timeFormatted: "09:30 AM",
        dateFormatted: "28 Jul",
        activityType: "Reseller Onboarding",
        actorType: "KAM",
        title: "Invitation Sent",
        desc: "Invitation link sent to Prime Commerce POC.",
        entity: "Prime Commerce",
        actor: "By Tanvir Hasan · KAM",
        status: "Pending",
        statusType: "waiting",
        iconType: "plus",
      },
      {
        id: "act-302",
        timeFormatted: "11:20 AM",
        dateFormatted: "28 Jul",
        activityType: "Reseller Onboarding",
        actorType: "KAM",
        title: "Reseller onboarding initiated",
        desc: "Account space reserved for Prime Commerce.",
        entity: "Prime Commerce",
        actor: "By Tanvir Hasan · KAM",
        status: "Created",
        statusType: "info",
        iconType: "plus",
      },
      {
        id: "act-303",
        timeFormatted: "03:40 PM",
        dateFormatted: "27 Jul",
        activityType: "Reseller Onboarding",
        actorType: "KAM",
        title: "Lead created",
        desc: "Lead status changed to active for Tanvir Hasan.",
        entity: "Lead Management",
        actor: "By Tanvir Hasan · KAM",
        status: "Completed",
        statusType: "approved",
        iconType: "check",
      },
    ],
  },
  {
    id: "r4",
    resellerId: "RSL-000096",
    name: "Smart Supply",
    initials: "SS",
    kam: "Nayeem Islam",
    status: "Active",
    type: "Enterprise Reseller",
    addedBy: "Nayeem Islam",
    onboardingDate: "15 Jul 2026",
    currentStage: "Settlement Ready",
    merchantsCount: 4,
    storesCount: 22,
    merchants: [
      { name: "SupplyTech", code: "MRC-00180", storesCount: 10 },
      { name: "Smart Express", code: "MRC-00182", storesCount: 12 },
    ],
    workflowSteps: [
      { step: 1, title: "Reseller Added", sub: "15 Jul", status: "completed" },
      { step: 2, title: "Registration", sub: "16 Jul", status: "completed" },
      { step: 3, title: "Documents", sub: "18 Jul", status: "completed" },
      { step: 4, title: "Commission", sub: "20 Jul", status: "completed" },
      { step: 5, title: "Store SLB", sub: "22 Jul", status: "completed" },
      { step: 6, title: "RA Review", sub: "25 Jul", status: "completed" },
      { step: 7, title: "Settlement", sub: "Active", status: "completed" },
    ],
    activities: [
      {
        id: "act-401",
        timeFormatted: "10:00 AM",
        dateFormatted: "10 Aug",
        activityType: "Settlement",
        actorType: "Accounts",
        title: "Settlement completed",
        desc: "Weekly settlement disbursed for Smart Supply stores.",
        entity: "22 stores",
        actor: "By Accounts Team",
        status: "Completed",
        statusType: "approved",
        iconType: "dollar",
      },
      {
        id: "act-402",
        timeFormatted: "03:15 PM",
        dateFormatted: "08 Aug",
        activityType: "Settlement",
        actorType: "RA",
        title: "Settlement verified",
        desc: "Revenue Assurance verified the weekly settlement package.",
        entity: "RA Team",
        actor: "By Nayeem Islam · RA",
        status: "Approved",
        statusType: "approved",
        iconType: "check",
      },
      {
        id: "act-403",
        timeFormatted: "09:30 AM",
        dateFormatted: "05 Aug",
        activityType: "Store Configuration",
        actorType: "OPS",
        title: "Stores mapping updated",
        desc: "22 stores successfully linked under Smart Supply reseller profile.",
        entity: "22 stores",
        actor: "By Nusrat Jahan · OPS",
        status: "Completed",
        statusType: "approved",
        iconType: "store",
      },
      {
        id: "act-404",
        timeFormatted: "11:00 AM",
        dateFormatted: "01 Aug",
        activityType: "Commission",
        actorType: "KAM",
        title: "Commission slab active",
        desc: "Proposed 1.8% commission slab is active.",
        entity: "1.8% Slab",
        actor: "By Nayeem Islam · KAM",
        status: "Approved",
        statusType: "approved",
        iconType: "commission",
      },
      {
        id: "act-405",
        timeFormatted: "04:00 PM",
        dateFormatted: "15 Jul",
        activityType: "Reseller Onboarding",
        actorType: "Reseller",
        title: "Reseller profile created",
        desc: "Smart Supply onboarding verified.",
        entity: "Smart Supply",
        actor: "By Nayeem Islam · KAM",
        status: "Created",
        statusType: "info",
        iconType: "plus",
      },
    ],
  },
];

for (let i = 1; i <= 30; i++) {
  const numId = String(100 + i).padStart(6, "0");
  MOCK_RESELLERS.push({
    id: `dr${i}`,
    resellerId: `RSL-${numId}`,
    name: `Dynamic Reseller ${i}`,
    initials: `DR${i}`,
    kam: `Auto KAM ${(i % 3) + 1}`,
    status: i % 3 === 0 ? "Review" : i % 4 === 0 ? "Pending" : "Active",
    type: "Wholesale Partner",
    addedBy: "System",
    onboardingDate: "05 Aug 2026",
    currentStage: "Document Verification",
    merchantsCount: (i % 3) + 1,
    storesCount: (i % 5) + 2,
    merchants: Array.from({ length: (i % 3) + 1 }, (_, mIdx) => ({
      name: `Auto Merchant ${i}-${mIdx + 1}`,
      code: `MRC-${numId}-${mIdx}`,
      storesCount: 2,
    })),
    workflowSteps: [
      { step: 1, title: "Reseller Added", sub: "01 Aug", status: "completed" },
      { step: 2, title: "Registration", sub: "02 Aug", status: "completed" },
      { step: 3, title: "Documents", sub: "In Progress", status: "current" },
    ],
    activities: [],
  } as ResellerHierarchyData);
}

const globalTradeBd = MOCK_RESELLERS.find((r) => r.id === "r2");
if (globalTradeBd) {
  globalTradeBd.merchantsCount = 32;
  globalTradeBd.storesCount = 154;
  for (let i = 1; i <= 30; i++) {
    globalTradeBd.merchants.push({
      name: `Global Store ${i}`,
      code: `MRC-002${15 + i}`,
      storesCount: (i % 5) + 1,
    });
  }
}

const filterConfig: FilterConfig[] = [
  {
    key: "search",
    label: "Search",
    type: "input",
    icon: Search,
    placeholder: "Search reseller, merchant, store...",
  },
  {
    key: "date",
    type: "date-range",
    label: "Date Range",
    icon: Calendar,
  },
  {
    key: "reseller",
    label: "Reseller",
    type: "select",
    options: [
      { label: "All Resellers", value: "all" },
      { label: "ABC Distribution", value: "ABC Distribution" },
      { label: "Global Trade BD", value: "Global Trade BD" },
      { label: "Prime Commerce", value: "Prime Commerce" },
      { label: "Smart Supply", value: "Smart Supply" },
    ],
  },
  {
    key: "activity",
    label: "Activity",
    type: "select",
    options: [
      { label: "All Activities", value: "all" },
      { label: "Reseller Onboarding", value: "Reseller Onboarding" },
      { label: "Document Review", value: "Document Review" },
      { label: "Commission", value: "Commission" },
      { label: "Store Configuration", value: "Store Configuration" },
      { label: "Settlement", value: "Settlement" },
    ],
  },
  {
    key: "actor",
    label: "Actor",
    type: "select",
    options: [
      { label: "All Actors", value: "all" },
      { label: "KAM", value: "KAM" },
      { label: "OPS", value: "OPS" },
      { label: "Accounts", value: "Accounts" },
      { label: "RA", value: "RA" },
      { label: "Reseller", value: "Reseller" },
    ],
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "All Status", value: "all" },
      { label: "Completed", value: "Completed" },
      { label: "Pending", value: "Pending" },
      { label: "Approved", value: "Approved" },
      { label: "Submitted", value: "Submitted" },
      { label: "Accepted", value: "Accepted" },
      { label: "Awaiting Review", value: "Awaiting Review" },
      { label: "Created", value: "Created" },
    ],
  },
];

export default function ResellerHistoryLogPage() {
  const [selectedResellerId, setSelectedResellerId] = useState<string>("r1");
  const [localFilters, setLocalFilters] = useState<Record<string, any>>({
    search: "",
    date: { preset: "all", from: "", to: "" },
    reseller: "all",
    activity: "all",
    actor: "all",
    status: "all",
  });
  const [appliedFilters, setAppliedFilters] =
    useState<Record<string, any>>(localFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [resellerSearch, setResellerSearch] = useState("");
  const [resellerCurrentPage, setResellerCurrentPage] = useState(1);
  const resellerItemsPerPage = 10;

  const [merchantCurrentPage, setMerchantCurrentPage] = useState(1);
  const merchantItemsPerPage = 5;
  const [merchantSearch, setMerchantSearch] = useState("");

  const cardFilteredResellers = useMemo(() => {
    const q = resellerSearch.toLowerCase().trim();
    return MOCK_RESELLERS.filter((r) => {
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.resellerId.toLowerCase().includes(q)
      );
    });
  }, [resellerSearch]);

  const paginatedCardResellers = useMemo(() => {
    const start = (resellerCurrentPage - 1) * resellerItemsPerPage;
    return cardFilteredResellers.slice(start, start + resellerItemsPerPage);
  }, [cardFilteredResellers, resellerCurrentPage]);

  const resellerTotalPages =
    Math.ceil(cardFilteredResellers.length / resellerItemsPerPage) || 1;

  const selectedReseller = useMemo(() => {
    return (
      MOCK_RESELLERS.find((r) => r.id === selectedResellerId) ||
      MOCK_RESELLERS[0]
    );
  }, [selectedResellerId]);

  const handleFilterChange = (key: string, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setAppliedFilters(localFilters);
    setCurrentPage(1);

    if (localFilters.reseller && localFilters.reseller !== "all") {
      const found = MOCK_RESELLERS.find(
        (r) => r.name === localFilters.reseller,
      );
      if (found) {
        setSelectedResellerId(found.id);
      }
    }
  };

  const clearFilters = () => {
    const reset = {
      search: "",
      date: { preset: "all", from: "", to: "" },
      reseller: "all",
      activity: "all",
      actor: "all",
      status: "all",
    };
    setLocalFilters(reset);
    setAppliedFilters(reset);
    setCurrentPage(1);
  };

  const filteredResellers = useMemo(() => {
    const q = (appliedFilters.search || "").toLowerCase().trim();
    const rFilter = appliedFilters.reseller || "all";

    return MOCK_RESELLERS.filter((reseller) => {
      const matchesSearch =
        !q ||
        `${reseller.name} ${reseller.resellerId}`.toLowerCase().includes(q);
      const matchesReseller = rFilter === "all" || reseller.name === rFilter;
      return matchesSearch && matchesReseller;
    });
  }, [appliedFilters]);

  const filteredActivities = useMemo(() => {
    const q = (appliedFilters.search || "").toLowerCase().trim();
    const rFilter = appliedFilters.reseller || "all";
    const aFilter = appliedFilters.activity || "all";
    const acFilter = appliedFilters.actor || "all";
    const stFilter = appliedFilters.status || "all";

    const activitiesToFilter =
      rFilter === "all"
        ? MOCK_RESELLERS.flatMap((r) =>
            r.activities.map((act) => ({
              ...act,
              resellerId: r.resellerId,
              resellerName: r.name,
            })),
          )
        : (() => {
            const targetReseller =
              MOCK_RESELLERS.find((r) => r.name === rFilter) ||
              selectedReseller;
            return targetReseller.activities.map((act) => ({
              ...act,
              resellerId: targetReseller.resellerId,
              resellerName: targetReseller.name,
            }));
          })();

    const filtered = activitiesToFilter.filter((act) => {
      const fullText =
        `${act.title} ${act.desc} ${act.actor} ${act.entity} ${act.resellerName}`.toLowerCase();
      const matchesSearch = !q || fullText.includes(q);
      const matchesReseller = rFilter === "all" || act.resellerName === rFilter;
      const matchesActivity = aFilter === "all" || act.activityType === aFilter;
      const matchesActor = acFilter === "all" || act.actorType === acFilter;
      const matchesStatus = stFilter === "all" || act.status === stFilter;

      const matchesDate = (() => {
        const dateVal = appliedFilters.date;
        if (!dateVal || dateVal.preset === "all") return true;

        const activityDate = new Date(`${act.dateFormatted} 2026`);
        if (isNaN(activityDate.getTime())) return true;

        const today = new Date("2026-08-17");

        if (dateVal.preset === "today") {
          return activityDate.toDateString() === today.toDateString();
        }
        if (dateVal.preset === "last_day") {
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          return activityDate.toDateString() === yesterday.toDateString();
        }
        if (dateVal.preset === "7d") {
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(today.getDate() - 7);
          return activityDate >= sevenDaysAgo && activityDate <= today;
        }
        if (dateVal.preset === "30d") {
          const thirtyDaysAgo = new Date(today);
          thirtyDaysAgo.setDate(today.getDate() - 30);
          return activityDate >= thirtyDaysAgo && activityDate <= today;
        }
        if (dateVal.preset === "this_month") {
          return (
            activityDate.getMonth() === today.getMonth() &&
            activityDate.getFullYear() === today.getFullYear()
          );
        }
        if (dateVal.preset === "this_week") {
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          return activityDate >= startOfWeek && activityDate <= today;
        }
        if (dateVal.preset === "custom" && dateVal.from && dateVal.to) {
          const start = new Date(dateVal.from);
          start.setHours(0, 0, 0, 0);
          const end = new Date(dateVal.to);
          end.setHours(23, 59, 59, 999);
          return activityDate >= start && activityDate <= end;
        }
        return true;
      })();

      return (
        matchesSearch &&
        matchesReseller &&
        matchesActivity &&
        matchesActor &&
        matchesStatus &&
        matchesDate
      );
    });

    return filtered.sort((a, b) => {
      const dateA = new Date(`${a.dateFormatted} 2026 ${a.timeFormatted}`);
      const dateB = new Date(`${b.dateFormatted} 2026 ${b.timeFormatted}`);
      return dateB.getTime() - dateA.getTime();
    });
  }, [selectedReseller, appliedFilters]);

  const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredActivities.slice(start, start + itemsPerPage);
  }, [filteredActivities, currentPage]);

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage) || 1;

  const metrics = useMemo(() => {
    const allResellersCount = MOCK_RESELLERS.length;
    const ratio = filteredResellers.length / allResellersCount;

    const q = (appliedFilters.search || "").toLowerCase().trim();
    const rFilter = appliedFilters.reseller || "all";
    const aFilter = appliedFilters.activity || "all";
    const acFilter = appliedFilters.actor || "all";
    const stFilter = appliedFilters.status || "all";
    const hasFilters =
      q ||
      rFilter !== "all" ||
      aFilter !== "all" ||
      acFilter !== "all" ||
      stFilter !== "all" ||
      (appliedFilters.date && appliedFilters.date.preset !== "all");

    if (!hasFilters) {
      return {
        totalResellers: 128,
        totalMerchants: 342,
        totalStores: 1284,
        pendingReviews: 17,
        settlements: 94,
      };
    }

    return {
      totalResellers: Math.max(1, Math.round(128 * ratio)),
      totalMerchants: Math.max(
        1,
        Math.round(
          342 *
            (filteredResellers.reduce((sum, r) => sum + r.merchantsCount, 0) /
              10),
        ),
      ),
      totalStores: Math.max(
        1,
        Math.round(
          1284 *
            (filteredResellers.reduce((sum, r) => sum + r.storesCount, 0) / 51),
        ),
      ),
      pendingReviews: Math.round(
        17 *
          (filteredResellers.filter(
            (r) => r.status === "Review" || r.status === "Pending",
          ).length /
            2),
      ),
      settlements: Math.round(
        94 *
          (filteredActivities.filter((act) => act.activityType === "Settlement")
            .length /
            5),
      ),
    };
  }, [filteredResellers, filteredActivities, appliedFilters]);

  const handleExportCSV = () => {
    if (!filteredActivities.length) return;

    const headers = [
      "Date/Time",
      "Reseller ID",
      "Reseller Name",
      "Activity Title",
      "Actor",
      "Status",
      "Description",
    ];
    const rows = filteredActivities.map((act) => [
      `"${act.dateFormatted} ${act.timeFormatted}"`,
      `"${act.resellerId}"`,
      `"${act.resellerName}"`,
      `"${act.title.replace(/"/g, '""')}"`,
      `"${act.actor.replace(/"/g, '""')}"`,
      `"${act.status}"`,
      `"${act.desc.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `reseller_history_${selectedReseller.resellerId}_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusBadgeClass = (statusType: string) => {
    switch (statusType) {
      case "approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "waiting":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "rejected":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "info":
      default:
        return "bg-primary-50 text-primary-700 border-primary-200";
    }
  };

  const getActivityIcon = (iconType: string) => {
    switch (iconType) {
      case "dollar":
        return <DollarSign className="w-3.5 h-3.5 text-primary-600" />;
      case "check":
        return <Check className="w-3.5 h-3.5 text-emerald-600" />;
      case "document":
        return <FileText className="w-3.5 h-3.5 text-indigo-600" />;
      case "commission":
        return <Percent className="w-3.5 h-3.5 text-amber-600" />;
      case "store":
        return <Store className="w-3.5 h-3.5 text-primary-600" />;
      case "plus":
        return <Plus className="w-3.5 h-3.5 text-primary-600" />;
      case "refund":
        return <RefreshCw className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getActivityIconBg = (iconType: string) => {
    switch (iconType) {
      case "dollar":
        return "bg-primary-50 border-primary-100";
      case "check":
        return "bg-emerald-50 border-emerald-100";
      case "document":
        return "bg-indigo-50 border-indigo-100";
      case "commission":
        return "bg-amber-50 border-amber-100";
      case "store":
        return "bg-primary-50 border-primary-100";
      case "plus":
        return "bg-primary-50 border-primary-100";
      case "refund":
        return "bg-purple-50 border-purple-100";
      default:
        return "bg-slate-100 border-slate-200";
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Reseller History Log
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track reseller onboarding, documents, commission, stores and
            settlement activities.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-slate-500" />
          Export History
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <FilterBar
          filters={localFilters}
          onFilterChange={handleFilterChange}
          config={filterConfig}
        />
        <button
          onClick={applyFilters}
          disabled={
            JSON.stringify(localFilters) === JSON.stringify(appliedFilters)
          }
          className={clsx(
            "flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-full transition-all shadow-sm ml-2",
            JSON.stringify(localFilters) !== JSON.stringify(appliedFilters)
              ? "bg-primary-600 hover:bg-primary-700 text-white"
              : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200",
          )}
        >
          Apply Filters
        </button>
        <ClearAllFiltersButton onClick={clearFilters} filters={localFilters} />
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Resellers
          </span>
          <div className="my-2">
            <span className="text-2xl font-bold text-slate-900">
              {metrics.totalResellers.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+12.5%</span>
            <span className="text-slate-400 font-normal ml-0.5">
              vs prev period
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Merchants
          </span>
          <div className="my-2">
            <span className="text-2xl font-bold text-slate-900">
              {metrics.totalMerchants.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-500">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>-2.2%</span>
            <span className="text-slate-400 font-normal ml-0.5">
              vs prev period
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Stores
          </span>
          <div className="my-2">
            <span className="text-2xl font-bold text-slate-900">
              {metrics.totalStores.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+8.7%</span>
            <span className="text-slate-400 font-normal ml-0.5">
              vs prev period
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pending Reviews
          </span>
          <div className="my-2">
            <span className="text-2xl font-bold text-slate-900">
              {metrics.pendingReviews.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-500">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>-5.4%</span>
            <span className="text-slate-400 font-normal ml-0.5">
              vs prev period
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Settlements
          </span>
          <div className="my-2">
            <span className="text-2xl font-bold text-slate-900">
              {metrics.settlements.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+14.8%</span>
            <span className="text-slate-400 font-normal ml-0.5">
              vs prev period
            </span>
          </div>
        </div>
      </div>

      {/* Workspace Grid */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Panel: Reseller Hierarchy */}
        <div className="w-full lg:w-80 flex-shrink-0 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="px-4 py-3.5 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Reseller Hierarchy
              </h3>
              <span className="px-2 py-0.5 text-[11px] font-bold bg-primary-50 text-primary-700 rounded-full border border-primary-200">
                {cardFilteredResellers.length}
              </span>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search resellers..."
                value={resellerSearch}
                onChange={(e) => {
                  setResellerSearch(e.target.value);
                  setResellerCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="p-3 space-y-3">
            {paginatedCardResellers.map((reseller) => {
              const isSelected = reseller.id === selectedResellerId;

              const filteredMerchants =
                isSelected && merchantSearch
                  ? reseller.merchants.filter(
                      (m) =>
                        m.name
                          .toLowerCase()
                          .includes(merchantSearch.toLowerCase()) ||
                        m.code
                          .toLowerCase()
                          .includes(merchantSearch.toLowerCase()),
                    )
                  : reseller.merchants;

              return (
                <div
                  key={reseller.id}
                  onClick={() => {
                    setSelectedResellerId(reseller.id);
                    setLocalFilters((prev) => ({
                      ...prev,
                      reseller: reseller.name,
                    }));
                    setAppliedFilters((prev) => ({
                      ...prev,
                      reseller: reseller.name,
                    }));
                    setCurrentPage(1);
                    setMerchantCurrentPage(1);
                    setMerchantSearch("");
                  }}
                  className={clsx(
                    "border rounded-xl transition-all duration-300 ease-in-out cursor-pointer overflow-hidden",
                    isSelected
                      ? "border-primary-500 bg-primary-50/20 ring-2 ring-primary-500/20 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50",
                  )}
                >
                  <div className="p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-200">
                      {reseller.logo ? (
                        <img
                          src={reseller.logo}
                          alt={reseller.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const fallback = e.currentTarget.nextElementSibling;
                            if (fallback) {
                              (fallback as HTMLElement).style.display = "block";
                            }
                          }}
                        />
                      ) : null}
                      <Handshake
                        className="w-4 h-4 text-slate-400"
                        style={{ display: reseller.logo ? "none" : "block" }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate leading-tight">
                        {reseller.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {reseller.resellerId} · KAM:{" "}
                        {reseller.kam.split(" ")[0]}
                      </p>
                    </div>
                    <span
                      className={clsx(
                        "px-2 py-0.5 text-[10px] font-bold rounded-full border whitespace-nowrap transition-colors duration-200",
                        reseller.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : reseller.status === "Review"
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                            : "bg-amber-50 text-amber-700 border-amber-200",
                      )}
                    >
                      {reseller.status}
                    </span>
                  </div>

                  {/* Merchants List with smooth grid height transition */}
                  <div
                    className={clsx(
                      "grid transition-all duration-300 ease-in-out",
                      isSelected
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0",
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t border-slate-100 bg-slate-50/80 pl-14 pr-3 py-2 space-y-1.5">
                        {isSelected &&
                          reseller.merchants.length > merchantItemsPerPage && (
                            <div className="relative mb-2">
                              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                              <input
                                type="text"
                                placeholder="Search merchants..."
                                value={merchantSearch}
                                onChange={(e) => {
                                  setMerchantSearch(e.target.value);
                                  setMerchantCurrentPage(1);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full pl-6 pr-2 py-1 text-[10px] bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500 transition-all placeholder:text-slate-400"
                              />
                            </div>
                          )}

                        {filteredMerchants
                          .slice(
                            isSelected
                              ? (merchantCurrentPage - 1) * merchantItemsPerPage
                              : 0,
                            isSelected
                              ? merchantCurrentPage * merchantItemsPerPage
                              : filteredMerchants.length,
                          )
                          .map((merchant) => (
                            <div
                              key={merchant.code}
                              className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0"
                            >
                              <div>
                                <span className="font-semibold text-slate-800 block text-[11px]">
                                  {merchant.name}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {merchant.code}
                                </span>
                              </div>
                              <span className="text-[10px] font-semibold text-primary-600">
                                {merchant.storesCount} Stores
                              </span>
                            </div>
                          ))}

                        {isSelected &&
                          filteredMerchants.length > merchantItemsPerPage && (
                            <div className="flex items-center justify-between pt-2 pb-1 text-[10px] text-slate-500">
                              <span>
                                {(merchantCurrentPage - 1) *
                                  merchantItemsPerPage +
                                  1}
                                –
                                {Math.min(
                                  merchantCurrentPage * merchantItemsPerPage,
                                  filteredMerchants.length,
                                )}{" "}
                                of {filteredMerchants.length}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={merchantCurrentPage === 1}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMerchantCurrentPage((p) =>
                                      Math.max(1, p - 1),
                                    );
                                  }}
                                  className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
                                >
                                  <ChevronLeft className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={
                                    merchantCurrentPage >=
                                    Math.ceil(
                                      filteredMerchants.length /
                                        merchantItemsPerPage,
                                    )
                                  }
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMerchantCurrentPage((p) =>
                                      Math.min(
                                        Math.ceil(
                                          filteredMerchants.length /
                                            merchantItemsPerPage,
                                        ),
                                        p + 1,
                                      ),
                                    );
                                  }}
                                  className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
                                >
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          )}

                        {isSelected &&
                          merchantSearch &&
                          filteredMerchants.length === 0 && (
                            <div className="text-center py-2 text-[10px] text-slate-400">
                              No merchants found.
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination for Reseller Hierarchy */}
          {cardFilteredResellers.length > 0 && (
            <div className="p-3 border-t border-slate-100 bg-white flex items-center justify-between text-xs text-slate-500">
              <span>
                {(resellerCurrentPage - 1) * resellerItemsPerPage + 1}–
                {Math.min(
                  resellerCurrentPage * resellerItemsPerPage,
                  cardFilteredResellers.length,
                )}{" "}
                of {cardFilteredResellers.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={resellerCurrentPage === 1}
                  onClick={() =>
                    setResellerCurrentPage((p) => Math.max(1, p - 1))
                  }
                  className="p-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={resellerCurrentPage === resellerTotalPages}
                  onClick={() =>
                    setResellerCurrentPage((p) =>
                      Math.min(resellerTotalPages, p + 1),
                    )
                  }
                  className="p-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Reseller Details & Activities */}
        <div
          key={selectedReseller.id}
          className="flex-1 min-w-0 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col divide-y divide-slate-100 transition-all duration-300 ease-in-out"
        >
          {/* Entity Header */}
          <div className="p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-200">
                {selectedReseller.logo ? (
                  <img
                    src={selectedReseller.logo}
                    alt={selectedReseller.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const fallback = e.currentTarget.nextElementSibling;
                      if (fallback) {
                        (fallback as HTMLElement).style.display = "block";
                      }
                    }}
                  />
                ) : null}
                <Handshake
                  className="w-6 h-6 text-slate-400"
                  style={{ display: selectedReseller.logo ? "none" : "block" }}
                />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 leading-tight">
                  {selectedReseller.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedReseller.resellerId}
                </p>
              </div>
            </div>
          </div>

          {/* Entity Info Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 bg-slate-50/40">
            <div className="p-4 border-r border-slate-100 last:border-r-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                KAM Owner
              </span>
              <span className="text-xs font-semibold text-slate-900">
                {selectedReseller.kam}
              </span>
            </div>
            <div className="p-4 border-r border-slate-100 last:border-r-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Merchants
              </span>
              <span className="text-xs font-semibold text-slate-900">
                {selectedReseller.merchantsCount} Merchants
              </span>
            </div>
            <div className="p-4 border-r border-slate-100 last:border-r-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Stores
              </span>
              <span className="text-xs font-semibold text-slate-900">
                {selectedReseller.storesCount} Stores
              </span>
            </div>
            <div className="p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Current Stage
              </span>
              <span className="text-xs font-bold text-emerald-600">
                {selectedReseller.currentStage}
              </span>
            </div>
          </div>

          {/* Workflow Stepper */}
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Onboarding & Settlement Progress
              </h3>
              <span className="text-[11px] text-slate-400">
                Started: {selectedReseller.onboardingDate}
              </span>
            </div>

            <div className="relative flex justify-between items-start px-4">
              {/* Line connector background */}
              <div className="absolute top-3.5 left-14 right-14 h-0.5 bg-slate-200 -z-0" />

              {selectedReseller.workflowSteps.map((s, idx) => (
                <div
                  key={s.step}
                  className="relative z-10 flex flex-col items-center text-center w-20"
                >
                  <div
                    className={clsx(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
                      s.status === "completed"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : s.status === "current"
                          ? "bg-primary-600 text-white border-primary-600 ring-4 ring-primary-100 shadow-sm"
                          : "bg-white text-slate-400 border-slate-300",
                    )}
                  >
                    {s.status === "completed" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      s.step
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-slate-800 mt-2 block leading-tight whitespace-nowrap">
                    {s.title}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {s.sub}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity History Timeline */}
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Activity History
              </h3>
              <span className="text-[11px] font-semibold text-slate-500">
                {filteredActivities.length} matching activities
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {paginatedActivities.map((act) => (
                <div
                  key={act.id}
                  className="py-3.5 flex items-start gap-4 hover:bg-slate-50/60 p-2 rounded-lg transition-colors"
                >
                  <div className="w-20 text-right flex-shrink-0">
                    <span className="text-[11px] font-bold text-slate-700 block">
                      {act.dateFormatted}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {act.timeFormatted}
                    </span>
                  </div>

                  <div
                    className={clsx(
                      "w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5",
                      getActivityIconBg(act.iconType),
                    )}
                  >
                    {getActivityIcon(act.iconType)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">
                      {act.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {act.desc}
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                      {act.actor}
                    </span>
                  </div>

                  <span
                    className={clsx(
                      "px-2.5 py-1 text-[10px] font-bold rounded-full border whitespace-nowrap self-start mt-0.5",
                      getStatusBadgeClass(act.statusType),
                    )}
                  >
                    {act.status}
                  </span>
                </div>
              ))}

              {paginatedActivities.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs font-medium">
                  No activity logs found matching the selected filters.
                </div>
              )}
            </div>

            {/* Pagination */}
            {filteredActivities.length > 0 && (
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Showing {(currentPage - 1) * itemsPerPage + 1}–
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredActivities.length,
                  )}{" "}
                  of {filteredActivities.length} activities
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setCurrentPage(p)}
                        className={clsx(
                          "w-7 h-7 rounded-md text-xs font-semibold border transition-all",
                          currentPage === p
                            ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50",
                        )}
                      >
                        {p}
                      </button>
                    ),
                  )}

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
