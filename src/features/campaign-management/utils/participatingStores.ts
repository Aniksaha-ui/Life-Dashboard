import type { CampaignStoreRequestRow } from "../types";

export interface ParticipatingStoreRow {
  id: number;
  storeId: string;
  discountPct: number;
  consumedByYou: string;
  sharedWithPartners: number;
  minOrder: number;
  maxPerTxn: number;
  maxPerCard: number;
  limitPerUser: number;
  remarks: string;
}

export const PARTICIPATING_STORES_MOCK: ParticipatingStoreRow[] = [
  {
    id: 1,
    storeId: "bannertestlive",
    discountPct: 34,
    consumedByYou: "No",
    sharedWithPartners: 0,
    minOrder: 12373,
    maxPerTxn: 253592,
    maxPerCard: 407780,
    limitPerUser: 311642,
    remarks: "Confirmed",
  },
  {
    id: 2,
    storeId: "bookingdemotestlive",
    discountPct: 96,
    consumedByYou: "No",
    sharedWithPartners: 0,
    minOrder: 63477,
    maxPerTxn: 392665,
    maxPerCard: 270144,
    limitPerUser: 271742,
    remarks: "Verified by KAM",
  },
  {
    id: 3,
    storeId: "BPSPHostedCheckout",
    discountPct: 59,
    consumedByYou: "Yes",
    sharedWithPartners: 0,
    minOrder: 6176,
    maxPerTxn: 114616,
    maxPerCard: 152739,
    limitPerUser: 143573,
    remarks: "Priority Campaign",
  },
  {
    id: 4,
    storeId: "brachealthcare1live",
    discountPct: 87,
    consumedByYou: "No",
    sharedWithPartners: 0,
    minOrder: 50231,
    maxPerTxn: 269779,
    maxPerCard: 337182,
    limitPerUser: 108527,
    remarks: "Standard Terms",
  },
];

export const mapParticipatingStoreToRequestRow = (
  row: ParticipatingStoreRow,
): CampaignStoreRequestRow => ({
  merchant: "—",
  brand: "—",
  storeId: row.storeId,
  kam: "—",
  category: "—",
  url: "—",
  disc: row.discountPct,
  consumed: row.consumedByYou,
  shared: row.sharedWithPartners,
  min: row.minOrder,
  max: row.maxPerTxn,
  maxAmt: row.maxPerCard,
  recurrentLimit: row.limitPerUser,
  sectors: "N/A",
  remarks: row.remarks,
});
