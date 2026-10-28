export interface GatewayRoutingRule {
  id: string;
  strid: string;
  startHour: string;
  endHour: string;
  bankName: string;
  status: "Active" | "Inactive";
}
