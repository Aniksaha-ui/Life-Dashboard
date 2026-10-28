export type InviteResellerStatus =
  "Created" | "Invited" | "Follow up" | "Onboarded";

export interface InviteResellerLogEntry {
  id: string;
  action: string;
  remarks: string;
  performedBy: string;
  performedAt: string;
}

export interface InviteReseller {
  id: string;
  resellerId: string;
  name: string;
  mobile: string;
  email: string;
  status: InviteResellerStatus;
  followUpCount: number;
  createdAt: string;
  logs: InviteResellerLogEntry[];
}
