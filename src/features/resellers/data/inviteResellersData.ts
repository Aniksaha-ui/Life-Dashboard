import type {
  InviteReseller,
  InviteResellerLogEntry,
  InviteResellerStatus,
} from "../types/inviteReseller";

const NAMES = [
  "Rahim Trading House",
  "Nusrat Digital Ventures",
  "Karim Soft Solutions",
  "Farhana Ecommerce BD",
  "Imran Payment Partners",
  "Sadia Merchant Hub",
  "Hassan Retail Network",
  "Jahan Gateway BD",
  "Ahmed Commerce Link",
  "Begum Online Stores",
  "Uddin Tech Reseller",
  "Rahman Pay Connect",
];

function getFollowUpCount(status: InviteResellerStatus, seed: number): number {
  if (status === "Follow up") return 1 + (seed % 3);
  if (status === "Onboarded") return 1 + (seed % 2);
  return 0;
}

function buildLogs(
  seed: number,
  status: InviteResellerStatus,
  followUpCount: number,
): InviteResellerLogEntry[] {
  const base = new Date(2026, 5, 1 + (seed % 20));
  const logs: InviteResellerLogEntry[] = [
    {
      id: `log-${seed}-1`,
      action: "Created",
      remarks: "Reseller invite record created.",
      performedBy: "KAM Admin",
      performedAt: base.toISOString(),
    },
  ];

  if (
    status === "Invited" ||
    status === "Follow up" ||
    status === "Onboarded"
  ) {
    logs.push({
      id: `log-${seed}-2`,
      action: "Invited",
      remarks: "Invitation email and SMS sent to reseller.",
      performedBy: "KAM Admin",
      performedAt: new Date(
        base.getTime() + 2 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    });
  }

  for (let i = 0; i < followUpCount; i += 1) {
    logs.push({
      id: `log-${seed}-follow-${i + 1}`,
      action: "Follow up",
      remarks: `Follow-up #${i + 1} recorded for reseller invite.`,
      performedBy: "KAM Admin",
      performedAt: new Date(
        base.getTime() + (5 + i) * 24 * 60 * 60 * 1000,
      ).toISOString(),
    });
  }

  if (status === "Onboarded") {
    logs.push({
      id: `log-${seed}-onboarded`,
      action: "Onboarded",
      remarks: "Reseller completed onboarding.",
      performedBy: "KAM Admin",
      performedAt: new Date(
        base.getTime() + (8 + followUpCount) * 24 * 60 * 60 * 1000,
      ).toISOString(),
    });
  }

  return logs;
}

const STATUSES: InviteResellerStatus[] = [
  "Created",
  "Invited",
  "Follow up",
  "Onboarded",
];

let inviteResellers: InviteReseller[] = NAMES.map((name, index) => {
  const seed = index + 1;
  const status = STATUSES[index % STATUSES.length];
  const followUpCount = getFollowUpCount(status, seed);
  return {
    id: `inv-res-${String(seed).padStart(3, "0")}`,
    resellerId: `INV-${String(101 + index).padStart(3, "0")}`,
    name,
    mobile: `017${String(10000000 + seed * 137).slice(-8)}`,
    email: `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
    status,
    followUpCount,
    createdAt: new Date(2026, 5, 1 + (seed % 20)).toISOString(),
    logs: buildLogs(seed, status, followUpCount),
  };
});

function appendLog(
  reseller: InviteReseller,
  action: string,
  remarks: string,
): InviteReseller {
  const entry: InviteResellerLogEntry = {
    id: `log-${reseller.id}-${Date.now()}`,
    action,
    remarks,
    performedBy: "KAM Admin",
    performedAt: new Date().toISOString(),
  };
  return {
    ...reseller,
    logs: [entry, ...reseller.logs],
  };
}

export function listInviteResellers(): InviteReseller[] {
  return [...inviteResellers];
}

export function getInviteResellerById(id: string): InviteReseller | undefined {
  return inviteResellers.find((item) => item.id === id);
}

export function inviteReseller(id: string): InviteReseller {
  const idx = inviteResellers.findIndex((item) => item.id === id);
  if (idx < 0) throw new Error("Invite reseller not found");

  const updated = appendLog(
    { ...inviteResellers[idx], status: "Invited" },
    "Invited",
    "Invitation email and SMS sent to reseller.",
  );
  inviteResellers[idx] = updated;
  return updated;
}

export function followUpInviteReseller(id: string): InviteReseller {
  const idx = inviteResellers.findIndex((item) => item.id === id);
  if (idx < 0) throw new Error("Invite reseller not found");

  const current = inviteResellers[idx];
  const followUpCount = current.followUpCount + 1;
  const updated = appendLog(
    { ...current, status: "Follow up", followUpCount },
    "Follow up",
    `Follow-up #${followUpCount} recorded for reseller invite.`,
  );
  inviteResellers[idx] = updated;
  return updated;
}

export function updateInviteReseller(
  id: string,
  updates: Partial<Pick<InviteReseller, "name" | "mobile" | "email">>,
): InviteReseller {
  const idx = inviteResellers.findIndex((item) => item.id === id);
  if (idx < 0) throw new Error("Invite reseller not found");

  const updated = appendLog(
    { ...inviteResellers[idx], ...updates },
    "Edited",
    "Reseller invite details updated.",
  );
  inviteResellers[idx] = updated;
  return updated;
}

export function deleteInviteReseller(id: string): void {
  inviteResellers = inviteResellers.filter((item) => item.id !== id);
}

export function createInviteReseller(input: {
  name: string;
  mobile: string;
  email: string;
}): InviteReseller {
  const nextNumber = inviteResellers.length + 101;
  const id = `inv-res-${String(inviteResellers.length + 1).padStart(3, "0")}-${Date.now().toString().slice(-4)}`;
  const created: InviteReseller = {
    id,
    resellerId: `INV-${String(nextNumber).padStart(3, "0")}`,
    name: input.name.trim(),
    mobile: input.mobile.trim(),
    email: input.email.trim(),
    status: "Created",
    followUpCount: 0,
    createdAt: new Date().toISOString(),
    logs: [
      {
        id: `log-${id}-1`,
        action: "Created",
        remarks: "Reseller invite record created.",
        performedBy: "KAM Admin",
        performedAt: new Date().toISOString(),
      },
    ],
  };
  inviteResellers = [created, ...inviteResellers];
  return created;
}
