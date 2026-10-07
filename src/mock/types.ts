import type { ToneKey } from '../theme';

export type Bilingual = { ar: string; en: string };

export type Status = {
  id: string; nameAr: string; nameEn: string; tone: ToneKey; icon: string;
  isFinal: boolean; sendPush: boolean; order: number; active: boolean;
};
export type Customer = { id: string; name: Bilingual; mobile: string; password: string; mustChange: boolean };
export type Staff = { id: string; name: Bilingual; email: string; password: string; role: 'manager' | 'staff'; active: boolean };
export type HistoryEntry = { statusId: string; note: Bilingual | null; byStaffId: string; at: string };
export type Shipment = { id: string; code: string; customerId: string; description: Bilingual; history: HistoryEntry[] };
export type PushEvent = { id: string; code: string; statusId: string; customerId: string; at: string };
export type AuditEntry = { id: string; action: string; byStaffId: string; details: string; at: string };

export type Db = {
  version: number;
  statuses: Status[];
  customers: Customer[];
  staff: Staff[];
  shipments: Shipment[];
  pushEvents: PushEvent[];
  audit: AuditEntry[];
  settings: { contactNumber: string };
};
