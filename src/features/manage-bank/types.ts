export interface Bank {
  id: string;
  bankName: string;
  bid: string;
  contactPerson: string;
  phone: string;
  email: string;
}

export interface CardType {
  id: string;
  cid: string;
  bankName: string;
  bid: string;
  cardType: string;
  startDigit: string;
  bankComm: number;
  merchantComm: number;
  gwType: string;
  status: "Active" | "Inactive";
}
