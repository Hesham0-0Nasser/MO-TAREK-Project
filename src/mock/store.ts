// Tiny persisted store. The whole mock "database" lives in localStorage so the customer app
// (/) and the admin dashboard (/admin) share state, including across two browser tabs.
import { useSyncExternalStore } from 'react';
import { DB_VERSION, seedDb } from './seed';
import type { Db } from './types';

const DB_KEY = 'shipment-demo:db';
const SESSION_KEY = 'shipment-demo:session';
const PREF_KEY = 'shipment-demo:prefs';

const read = (key: string): string | null => {
  try { return globalThis.localStorage?.getItem(key) ?? null; } catch { return null; }
};
const write = (key: string, value: string | null) => {
  try {
    if (value === null) globalThis.localStorage?.removeItem(key);
    else globalThis.localStorage?.setItem(key, value);
  } catch { /* private mode or blocked storage: the demo keeps working in memory */ }
};

function load(): Db {
  const raw = read(DB_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Db;
      if (parsed.version === DB_VERSION) return parsed;
    } catch { /* fall through to reseed */ }
  }
  const fresh = seedDb();
  write(DB_KEY, JSON.stringify(fresh));
  return fresh;
}

let db: Db = load();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
export const getDb = () => db;

export function updateDb(fn: (draft: Db) => Db | void) {
  const next = structuredClone(db);
  db = fn(next) ?? next;
  write(DB_KEY, JSON.stringify(db));
  emit();
}

export function resetDemoData() {
  db = seedDb();
  write(DB_KEY, JSON.stringify(db));
  write(SESSION_KEY, null);
  emit();
}

export const useDb = () => useSyncExternalStore(subscribe, getDb, getDb);

// ---- sessions + preferences (also persisted, also reactive) ----
type Session = { customerId?: string; staffId?: string };
type Prefs = { langCustomer?: 'ar' | 'en'; langAdmin?: 'ar' | 'en'; notifOn?: boolean };

const parse = <T,>(key: string): T => { try { return JSON.parse(read(key) ?? '{}') as T; } catch { return {} as T; } };
let session = parse<Session>(SESSION_KEY);
let prefs = parse<Prefs>(PREF_KEY);

export const getSession = () => session;
export function setSession(patch: Partial<Session>) {
  session = { ...session, ...patch };
  write(SESSION_KEY, JSON.stringify(session));
  emit();
}
export const useSession = () => useSyncExternalStore(subscribe, getSession, getSession);

export const getPrefs = () => prefs;
export function setPrefs(patch: Partial<Prefs>) {
  prefs = { ...prefs, ...patch };
  write(PREF_KEY, JSON.stringify(prefs));
  emit();
}
export const usePrefs = () => useSyncExternalStore(subscribe, getPrefs, getPrefs);

// Keep two open tabs in sync (admin updates a status, the customer tab reacts).
if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('storage', (e) => {
    if (e.key === DB_KEY) { db = load(); emit(); }
    if (e.key === SESSION_KEY) { session = parse<Session>(SESSION_KEY); emit(); }
    if (e.key === PREF_KEY) { prefs = parse<Prefs>(PREF_KEY); emit(); }
  });
}
