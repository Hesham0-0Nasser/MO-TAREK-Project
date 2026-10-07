// Mock API. Same shape the real API will have later; today it reads and writes the local store.
// Every call is async with a short delay so loading states are visible in the demo.
import { daysBetween } from './format';
import { getDb, setSession, updateDb } from './store';
import type { Bilingual, Customer, Db, Shipment, Staff, Status } from './types';

export class ApiError extends Error {
  constructor(public code: string) { super(code); }
}
const delay = (ms = 450) => new Promise((r) => setTimeout(r, ms));
const uid = (p: string) => p + Math.random().toString(36).slice(2, 9);

// ---------- helpers ----------
// No 0/O/1/I/L so codes can be read aloud or typed from a photo without mistakes (PRD 7).
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export function generateCode(existing: Set<string>): string {
  for (;;) {
    const bytes = new Uint8Array(10);
    globalThis.crypto.getRandomValues(bytes);
    const code = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
    if (!existing.has(code)) return code;
  }
}
export const normalizeMobile = (raw: string) => {
  let m = raw.replace(/\D/g, '');
  if (m.startsWith('966')) m = m.slice(3);
  if (m && !m.startsWith('0')) m = '0' + m;
  return m;
};
export const isValidMobile = (m: string) => /^05\d{8}$/.test(m);

export const currentStatus = (db: Db, s: Shipment) => db.statuses.find((x) => x.id === s.history[s.history.length - 1].statusId)!;
export const lastUpdate = (s: Shipment) => s.history[s.history.length - 1].at;
export const sortedStatuses = (db: Db) => [...db.statuses].sort((a, b) => a.order - b.order);

function audit(db: Db, action: string, byStaffId: string, details: string) {
  db.audit.unshift({ id: uid('a'), action, byStaffId, details, at: new Date().toISOString() });
  db.audit = db.audit.slice(0, 200);
}

// ---------- public lookup (guest) ----------
const attempts: number[] = [];
export type PublicShipment = { code: string; status: Status; history: { status: Status; note: Bilingual | null; at: string }[] };

/** Status and timeline only. No customer name, mobile or description (PRD 7). */
export async function getShipmentByCode(raw: string): Promise<PublicShipment> {
  await delay();
  const now = Date.now();
  while (attempts.length && now - attempts[0] > 60000) attempts.shift();
  attempts.push(now);
  if (attempts.length > 12) throw new ApiError('rate_limited');
  const db = getDb();
  const s = db.shipments.find((x) => x.code === raw.trim().toUpperCase());
  if (!s) throw new ApiError('not_found');
  return {
    code: s.code,
    status: currentStatus(db, s),
    history: s.history.map((h) => ({ status: db.statuses.find((x) => x.id === h.statusId)!, note: h.note, at: h.at })),
  };
}

// ---------- customer auth ----------
export async function login(mobileRaw: string, password: string): Promise<{ customer: Customer; mustChange: boolean }> {
  await delay();
  const mobile = normalizeMobile(mobileRaw);
  const c = getDb().customers.find((x) => x.mobile === mobile);
  if (!c || c.password !== password) throw new ApiError('invalid_credentials');
  setSession({ customerId: c.id });
  return { customer: c, mustChange: c.mustChange };
}
export function logout() { setSession({ customerId: undefined }); }

export async function changePassword(customerId: string, newPassword: string) {
  await delay(300);
  if (newPassword.length < 8) throw new ApiError('weak_password');
  updateDb((d) => {
    const c = d.customers.find((x) => x.id === customerId)!;
    c.password = newPassword;
    c.mustChange = false;
  });
}

export async function getContactNumber() { return getDb().settings.contactNumber; }

// ---------- customer shipments ----------
export async function listMyShipments(customerId: string) {
  await delay(600);
  const db = getDb();
  return db.shipments
    .filter((s) => s.customerId === customerId)
    .sort((a, b) => lastUpdate(b).localeCompare(lastUpdate(a)));
}
export async function getMyShipment(code: string, customerId: string) {
  await delay();
  const db = getDb();
  const s = db.shipments.find((x) => x.code === code.trim().toUpperCase());
  if (!s) throw new ApiError('not_found');
  return { shipment: s, owned: s.customerId === customerId };
}

// ---------- admin auth ----------
export async function adminLogin(email: string, password: string): Promise<Staff> {
  await delay(400);
  const st = getDb().staff.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
  if (!st || st.password !== password || !st.active) throw new ApiError('invalid_credentials');
  setSession({ staffId: st.id });
  return st;
}
export function adminLogout() { setSession({ staffId: undefined }); }

// ---------- admin: shipments ----------
export type ShipmentFilters = { query?: string; statusId?: string; date?: 'any' | 'today' | '7' | '30'; page?: number; pageSize?: number };
export function filterShipments(db: Db, f: ShipmentFilters) {
  const q = (f.query ?? '').trim().toUpperCase();
  const qd = q.replace(/\D/g, '');
  const maxAge = f.date === 'today' ? 0 : f.date === '7' ? 7 : f.date === '30' ? 30 : Infinity;
  return db.shipments
    .filter((s) => {
      const c = db.customers.find((x) => x.id === s.customerId);
      if (q && !(s.code.includes(q) || (qd.length >= 3 && c?.mobile.includes(qd)))) return false;
      if (f.statusId && f.statusId !== 'all' && s.history[s.history.length - 1].statusId !== f.statusId) return false;
      if (daysBetween(lastUpdate(s)) > maxAge) return false;
      return true;
    })
    .sort((a, b) => lastUpdate(b).localeCompare(lastUpdate(a)));
}
export async function listShipments(f: ShipmentFilters) {
  await delay(250);
  const all = filterShipments(getDb(), f);
  const size = f.pageSize ?? 6, page = f.page ?? 1;
  return { total: all.length, items: all.slice((page - 1) * size, page * size) };
}

export type AddShipmentInput = { customerId?: string; newCustomer?: { name: string; mobile: string }; description?: string; statusId: string };
export async function addShipment(input: AddShipmentInput, staffId: string): Promise<Shipment> {
  await delay(350);
  let created!: Shipment;
  updateDb((d) => {
    let customerId = input.customerId;
    if (!customerId) {
      const nc = input.newCustomer;
      const mobile = normalizeMobile(nc?.mobile ?? '');
      if (!nc || !nc.name.trim() || !isValidMobile(mobile)) throw new ApiError('invalid_customer');
      const existing = d.customers.find((c) => c.mobile === mobile);
      customerId = existing?.id ?? uid('c');
      if (!existing) d.customers.push({ id: customerId, name: { ar: nc.name.trim(), en: nc.name.trim() }, mobile, password: 'demo1234', mustChange: false });
    }
    const desc = input.description?.trim() || '—';
    created = {
      id: uid('sh_'), code: generateCode(new Set(d.shipments.map((s) => s.code))), customerId,
      description: { ar: desc, en: desc },
      history: [{ statusId: input.statusId, note: null, byStaffId: staffId, at: new Date().toISOString() }],
    };
    d.shipments.unshift(created);
    audit(d, 'shipment.create', staffId, created.code);
  });
  return created;
}

export async function updateShipmentStatus(code: string, statusId: string, note: string, staffId: string) {
  await delay(350);
  let pushed = false;
  updateDb((d) => {
    const s = d.shipments.find((x) => x.code === code);
    const st = d.statuses.find((x) => x.id === statusId);
    if (!s || !st) throw new ApiError('not_found');
    const at = new Date().toISOString();
    const n = note.trim();
    s.history.push({ statusId, note: n ? { ar: n, en: n } : null, byStaffId: staffId, at });
    if (st.sendPush) {
      d.pushEvents.push({ id: uid('p'), code, statusId, customerId: s.customerId, at });
      d.pushEvents = d.pushEvents.slice(-30);
      pushed = true;
    }
    audit(d, 'shipment.status', staffId, `${code} → ${st.nameEn}`);
  });
  return { pushed };
}

// ---------- admin: statuses ----------
export const statusUsage = (db: Db, id: string) => db.shipments.filter((s) => s.history.some((h) => h.statusId === id)).length;
export async function listStatuses() { await delay(150); return sortedStatuses(getDb()); }
export type SaveStatusInput = Omit<Status, 'id' | 'order' | 'active'> & { id?: string };
export async function saveStatus(input: SaveStatusInput) {
  await delay(200);
  updateDb((d) => {
    if (input.id) {
      const s = d.statuses.find((x) => x.id === input.id)!;
      Object.assign(s, input); // renaming is reflected in old shipments too (PRD 5.4)
    } else {
      d.statuses.push({ ...input, id: uid('st'), order: Math.max(0, ...d.statuses.map((x) => x.order)) + 1, active: true });
    }
  });
}
export function reorderStatuses(ids: string[]) {
  updateDb((d) => { ids.forEach((id, i) => { d.statuses.find((s) => s.id === id)!.order = i + 1; }); });
}
export function setStatusActive(id: string, active: boolean) {
  updateDb((d) => { d.statuses.find((s) => s.id === id)!.active = active; });
}
/** A status used by any shipment can only be deactivated, never deleted (PRD 5.4). */
export function deleteStatus(id: string) {
  if (statusUsage(getDb(), id) > 0) throw new ApiError('status_in_use');
  updateDb((d) => { d.statuses = d.statuses.filter((s) => s.id !== id); });
}

// ---------- admin: customers ----------
export async function listCustomers() { await delay(150); return getDb().customers; }
export async function addCustomer(name: string, mobileRaw: string, staffId: string) {
  await delay(250);
  const mobile = normalizeMobile(mobileRaw);
  if (!name.trim() || !isValidMobile(mobile)) throw new ApiError('invalid_customer');
  if (getDb().customers.some((c) => c.mobile === mobile)) throw new ApiError('mobile_exists');
  updateDb((d) => {
    d.customers.push({ id: uid('c'), name: { ar: name.trim(), en: name.trim() }, mobile, password: 'demo1234', mustChange: false });
    audit(d, 'customer.create', staffId, mobile);
  });
}

const TEMP_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const rand = (n: number) => Array.from(globalThis.crypto.getRandomValues(new Uint8Array(n)), (b) => TEMP_ALPHABET[b % TEMP_ALPHABET.length]).join('');
/** Returns the temporary password once; the customer must change it at next login (PRD 5.6). */
export async function resetPassword(customerId: string, staffId: string): Promise<string> {
  await delay(350);
  const temp = `${rand(4)}-${rand(4)}`;
  updateDb((d) => {
    const c = d.customers.find((x) => x.id === customerId)!;
    c.password = temp;
    c.mustChange = true;
    audit(d, 'customer.reset_password', staffId, c.mobile);
  });
  return temp;
}

// ---------- admin: settings + staff ----------
export function saveContactNumber(value: string, staffId: string) {
  updateDb((d) => { d.settings.contactNumber = value.trim(); audit(d, 'settings.contact', staffId, value); });
}
export function addStaff(name: string, email: string, role: Staff['role']) {
  updateDb((d) => { d.staff.push({ id: uid('s'), name: { ar: name.trim(), en: name.trim() }, email: email.trim(), password: 'demo1234', role, active: true }); });
}
export function setStaffActive(id: string, active: boolean) {
  updateDb((d) => { d.staff.find((s) => s.id === id)!.active = active; });
}
