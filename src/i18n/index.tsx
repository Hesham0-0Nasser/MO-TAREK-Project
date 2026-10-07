import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { theme } from '../theme';
import { usePrefs, setPrefs } from '../mock/store';
import { ADMIN_STRINGS, CUSTOMER_STRINGS, type AdminKey, type CustomerKey, type Lang } from './strings';

type Area = 'customer' | 'admin';
type Ctx = { lang: Lang; rtl: boolean; dir: 'rtl' | 'ltr'; font: string; setLang: (l: Lang) => void; area: Area };
const LangContext = createContext<Ctx>(null as unknown as Ctx);

const fill = (s: string, vars?: Record<string, string | number>) =>
  vars ? s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? '')) : s;

/** Arabic first. Each area (customer app, admin) remembers its own language. */
export function LangProvider({ area, children }: { area: Area; children: React.ReactNode }) {
  const prefs = usePrefs();
  const lang: Lang = (area === 'customer' ? prefs.langCustomer : prefs.langAdmin) ?? 'ar';
  const value = useMemo<Ctx>(() => ({
    lang, area, rtl: lang === 'ar', dir: lang === 'ar' ? 'rtl' : 'ltr',
    font: lang === 'ar' ? theme.font.ar : theme.font.en,
    setLang: (l) => setPrefs(area === 'customer' ? { langCustomer: l } : { langAdmin: l }),
  }), [lang, area]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);

export function useT() {
  const { lang } = useLang();
  return useCallback((key: CustomerKey, vars?: Record<string, string | number>) => fill(CUSTOMER_STRINGS[lang][key], vars), [lang]);
}
export function useAdminT() {
  const { lang } = useLang();
  return useCallback((key: AdminKey, vars?: Record<string, string | number>) => fill(ADMIN_STRINGS[key][lang === 'ar' ? 1 : 0], vars), [lang]);
}
