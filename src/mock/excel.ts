// Excel import for the admin dashboard: parse (SheetJS) -> validate/preview -> commit.
import * as XLSX from 'xlsx';
import { generateCode, isValidMobile, normalizeMobile } from './api';
import { getDb, updateDb } from './store';
import type { Db } from './types';

export const MAX_ROWS = 1000;
export type RawRow = { mobile: string; name: string; description: string; status: string };
export type RowError = { row: number; reason: 'mobile_missing' | 'mobile_invalid' | 'status_unknown' | 'customer_unknown' };
export type ValidRow = { row: number; mobile: string; name: string; description: string; statusId: string };
export type Preview = { valid: ValidRow[]; errors: RowError[]; total: number; tooMany: boolean };

const HEADERS = ['mobile', 'name', 'description', 'status'];

export function downloadTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([HEADERS, ['0551234567', 'Ahmed Al-Otaibi', 'Car spare parts', 'Received']]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Shipments');
  XLSX.writeFile(wb, 'shipments-template.xlsx');
}

/** Built-in sample so the 3-step flow can be shown without a file (includes a few bad rows). */
export function sampleRows(): RawRow[] {
  const good: RawRow[] = [
    ['0551234567', '', 'Auto parts', 'Received'], ['0509876543', '', 'Printer paper', 'In transit'], ['0543217890', '', 'Kitchen appliances', 'Received'],
    ['0567654321', '', 'Tires', 'Received'], ['0532468135', '', 'Office chairs', 'In transit'], ['0551234567', '', 'Mobile accessories', 'Received'],
    ['0509876543', '', 'Cleaning supplies', 'Received'], ['0543217890', '', 'School uniforms', ''], ['0512345678', 'Faisal Al-Dossary', 'Garden tools', 'Received'],
    ['0598765432', 'Huda Al-Mutairi', 'Perfume gift sets', 'In transit'],
  ].map(([mobile, name, description, status]) => ({ mobile, name, description, status }));
  return [
    ...good.slice(0, 3),
    { mobile: '055123', name: '', description: 'Lamps', status: 'Received' },
    ...good.slice(3, 6),
    { mobile: '0509999999', name: '', description: 'Toys', status: 'Shipped' },
    ...good.slice(6),
    { mobile: '', name: '', description: 'Books', status: 'Received' },
  ];
}

export async function parseFile(file: File): Promise<RawRow[]> {
  const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '', raw: false });
  const pick = (r: Record<string, unknown>, key: string) => {
    const k = Object.keys(r).find((x) => x.trim().toLowerCase() === key);
    return k ? String(r[k]).trim() : '';
  };
  return rows.map((r) => ({ mobile: pick(r, 'mobile'), name: pick(r, 'name'), description: pick(r, 'description'), status: pick(r, 'status') }));
}

export function buildPreview(rows: RawRow[], db: Db = getDb()): Preview {
  const tooMany = rows.length > MAX_ROWS;
  const valid: ValidRow[] = [], errors: RowError[] = [];
  const statuses = db.statuses.filter((s) => s.active);
  rows.slice(0, MAX_ROWS).forEach((r, i) => {
    const row = i + 2; // row 1 is the header
    if (!r.mobile.trim()) return void errors.push({ row, reason: 'mobile_missing' });
    const mobile = normalizeMobile(r.mobile);
    if (!isValidMobile(mobile)) return void errors.push({ row, reason: 'mobile_invalid' });
    let statusId = statuses[0].id;
    if (r.status.trim()) {
      const hit = statuses.find((s) => [s.nameEn, s.nameAr].some((n) => n.toLowerCase() === r.status.trim().toLowerCase()));
      if (!hit) return void errors.push({ row, reason: 'status_unknown' });
      statusId = hit.id;
    }
    // Unknown mobile needs a name so the customer account can be created (PRD 5.3).
    if (!db.customers.some((c) => c.mobile === mobile) && !r.name.trim()) return void errors.push({ row, reason: 'customer_unknown' });
    valid.push({ row, mobile, name: r.name.trim(), description: r.description.trim(), statusId });
  });
  return { valid, errors, total: rows.length, tooMany };
}

export type ImportedRow = { code: string; mobile: string; description: string };
export async function importExcel(valid: ValidRow[], staffId: string): Promise<ImportedRow[]> {
  await new Promise((r) => setTimeout(r, 600));
  const out: ImportedRow[] = [];
  updateDb((d) => {
    const codes = new Set(d.shipments.map((s) => s.code));
    const now = new Date().toISOString();
    for (const v of valid) {
      let c = d.customers.find((x) => x.mobile === v.mobile);
      if (!c) {
        c = { id: 'c' + Math.random().toString(36).slice(2, 8), name: { ar: v.name, en: v.name }, mobile: v.mobile, password: 'demo1234', mustChange: false };
        d.customers.push(c);
      }
      const code = generateCode(codes);
      codes.add(code);
      const desc = v.description || '—';
      d.shipments.unshift({ id: 'sh_' + code, code, customerId: c.id, description: { ar: desc, en: desc }, history: [{ statusId: v.statusId, note: null, byStaffId: staffId, at: now }] });
      out.push({ code, mobile: v.mobile, description: v.description });
    }
    d.audit.unshift({ id: 'a' + Date.now(), action: 'shipment.import', byStaffId: staffId, details: `${out.length} rows`, at: now });
  });
  return out;
}

export function downloadNumbers(rows: ImportedRow[]) {
  const ws = XLSX.utils.json_to_sheet(rows.map((r) => ({ 'Shipment number': r.code, Mobile: r.mobile, Description: r.description })));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Shipment numbers');
  XLSX.writeFile(wb, 'shipment-numbers.xlsx');
}
