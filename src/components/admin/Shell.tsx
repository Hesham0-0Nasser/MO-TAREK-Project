import * as Clipboard from 'expo-clipboard';
import { Redirect, usePathname, useRouter } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, View, type ViewStyle } from 'react-native';
import { useStaff } from '../../hooks/useCustomer';
import { useAdminT, useLang } from '../../i18n';
import { adminLogout } from '../../mock/api';
import { resetDemoData } from '../../mock/store';
import { c, theme } from '../../theme';
import { DemoBadge } from '../chrome';
import { Icon } from '../Icon';
import { Segmented, Text } from '../ui';
import { AdminToast, useIsDesktop } from './parts';

type AdminCtx = { toast: (text: string) => void; copy: (value: string) => Promise<void> };
const Ctx = createContext<AdminCtx>({ toast: () => {}, copy: async () => {} });
export const useAdmin = () => useContext(Ctx);

/** Sidebar (desktop) or top bar (mobile) around every admin page except login. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const t = useAdminT();
  const { lang, setLang, rtl } = useLang();
  const router = useRouter();
  const path = usePathname();
  const staff = useStaff();
  const desktop = useIsDesktop();
  const [text, setText] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const toast = useCallback((msg: string) => {
    clearTimeout(timer.current);
    setText(msg);
    timer.current = setTimeout(() => setText(null), 2400);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = useCallback(async (value: string) => {
    try { await Clipboard.setStringAsync(value); } catch { /* clipboard blocked */ }
    toast(t('copied'));
  }, [toast, t]);

  const isLogin = path === '/admin' || path === '/admin/';
  if (isLogin || !staff) {
    return <Ctx.Provider value={{ toast, copy }}>{children}<AdminToast text={text} /></Ctx.Provider>;
  }

  const manager = staff.role === 'manager';
  const items = [
    { href: '/admin/shipments', key: 'shipments', icon: 'package', label: t('navShipments'), mgr: false },
    { href: '/admin/customers', key: 'customers', icon: 'users', label: t('navCustomers'), mgr: false },
    { href: '/admin/statuses', key: 'statuses', icon: 'tag', label: t('navStatuses'), mgr: true },
    { href: '/admin/settings', key: 'settings', icon: 'sliders', label: t('navSettings'), mgr: true },
  ].filter((i) => manager || !i.mgr);
  const section = items.find((i) => path.startsWith(i.href))?.key;

  const nav = (
    <View style={{ flexDirection: desktop ? 'column' : 'row', gap: 4, flexWrap: 'wrap' }}>
      {items.map((i) => {
        const on = i.key === section;
        return (
          <Pressable key={i.key} accessibilityRole="link" onPress={() => router.push(i.href as never)} style={(st) => { const hovered = (st as { hovered?: boolean }).hovered; return ({ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, borderRadius: 12, backgroundColor: on ? c.primarySoft : hovered ? '#F9FAFB' : 'transparent', cursor: 'pointer' } as ViewStyle); }}>
            <Icon name={i.icon} size={20} color={on ? c.primary : c.text3} />
            <Text variant="bodyLg" weight="600" color={on ? c.primary : c.text2} style={{ fontSize: 15 }}>{i.label}</Text>
            {i.mgr && desktop ? <View style={{ marginStart: 'auto', paddingHorizontal: 8, height: 20, borderRadius: 10, backgroundColor: c.chipBg, justifyContent: 'center' }}><Text variant="meta" style={{ fontSize: 11 }} color={c.muted}>{t('managerOnly')}</Text></View> : null}
          </Pressable>
        );
      })}
    </View>
  );

  const langSeg = (
    <Segmented height={36} value={lang} onChange={setLang} options={[{ value: 'ar', label: 'العربية', font: theme.font.ar }, { value: 'en', label: 'English', font: theme.font.en }]} />
  );

  const footer = (
    <View style={{ gap: 10 }}>
      {langSeg}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
          <Text weight="700" color={c.primary}>{staff.name[lang].charAt(0)}</Text>
        </View>
        <Text variant="bodyLg" weight="600" style={{ flex: 1, fontSize: 15 }}>{staff.name[lang]}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={t('logout')} onPress={() => { adminLogout(); router.replace('/admin'); }} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', cursor: 'pointer' } as ViewStyle}>
          <Icon name="logout" size={18} color={c.danger} />
        </Pressable>
      </View>
      <View style={{ gap: 2 }}>
        <Text variant="meta" color={c.muted} style={{ fontSize: 12 }}>{t('demoNote')}</Text>
        <View style={{ flexDirection: 'row', gap: 14, flexWrap: 'wrap' }}>
          <Pressable accessibilityRole="button" onPress={() => { resetDemoData(); router.replace('/admin'); }} style={{ paddingVertical: 4, cursor: 'pointer' } as ViewStyle}><Text variant="meta" weight="600" color={c.primary} style={{ fontSize: 12, textDecorationLine: 'underline' }}>{t('resetDemo')}</Text></Pressable>
          <Pressable accessibilityRole="link" onPress={() => router.push('/')} style={{ paddingVertical: 4, cursor: 'pointer' } as ViewStyle}><Text variant="meta" weight="600" color={c.primary} style={{ fontSize: 12, textDecorationLine: 'underline' }}>{t('openApp')}</Text></Pressable>
        </View>
      </View>
    </View>
  );

  const brandRow = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}><Icon name={theme.brand.logoIcon} size={20} color="#fff" /></View>
      <View style={{ flexShrink: 1 }}>
        <Text variant="bodyLg" weight="700" style={{ fontSize: 16 }}>{rtl ? theme.brand.nameAr : theme.brand.nameEn}</Text>
        <Text variant="meta" color={c.muted} style={{ fontSize: 12 }}>{t('adminPanel')}</Text>
      </View>
      <DemoBadge />
    </View>
  );

  return (
    <Ctx.Provider value={{ toast, copy }}>
      <View style={{ flex: 1, flexDirection: desktop ? 'row' : 'column', backgroundColor: c.canvas }}>
        {desktop ? (
          <View style={{ width: 264, backgroundColor: '#fff', borderEndWidth: 1, borderEndColor: '#E4E7EC', padding: 20, gap: 24, justifyContent: 'space-between' }}>
            <View style={{ gap: 28 }}>{brandRow}{nav}</View>
            {footer}
          </View>
        ) : (
          <View style={{ backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E4E7EC', padding: 14, gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              {brandRow}
              <Pressable accessibilityRole="button" onPress={() => { adminLogout(); router.replace('/admin'); }} style={{ padding: 8, cursor: 'pointer' } as ViewStyle}><Icon name="logout" size={20} color={c.danger} /></Pressable>
            </View>
            {nav}
          </View>
        )}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: desktop ? 32 : 16, gap: 24, maxWidth: 1180, width: '100%', alignSelf: 'center' }}>
          {children}
          {!desktop ? footer : null}
        </ScrollView>
      </View>
      <AdminToast text={text} />
    </Ctx.Provider>
  );
}

/** Wrap a page that needs a signed-in staff member (and optionally a manager). */
export function RequireStaff({ manager, children }: { manager?: boolean; children: React.ReactNode }) {
  const staff = useStaff();
  const t = useAdminT();
  if (!staff) return <Redirect href="/admin" />;
  if (manager && staff.role !== 'manager') return <Text color={c.muted}>{t('managerNeeded')}</Text>;
  return <>{children}</>;
}
