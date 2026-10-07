import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, View, type ViewStyle } from 'react-native';
import { useLang, useT } from '../i18n';
import { useCustomer } from '../hooks/useCustomer';
import { getDb, useDb, usePrefs } from '../mock/store';
import type { Bilingual, Status } from '../mock/types';
import { theme, c } from '../theme';
import { Icon } from './Icon';
import { statusName, StatusHero, Timeline } from './shipment';
import { useToast } from './chrome';
import { Banner, Button, Card, SoftButton, Text } from './ui';

export const CodeDisplay = ({ code }: { code: string }) => {
  const t = useT();
  const toast = useToast();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <View style={{ gap: 2, alignItems: 'flex-start' }}>
        <Text variant="meta" color={c.muted}>{t('numLabel')}</Text>
        <Text variant="code" mono>{code}</Text>
      </View>
      <SoftButton
        icon="copy" label={t('copy')} height={44}
        onPress={async () => { try { await Clipboard.setStringAsync(code); } catch { /* clipboard blocked: still confirm in the demo */ } toast(t('copied')); }}
      />
    </View>
  );
};

export type ShipmentViewData = {
  code: string; status: Status; lastAt: string; description?: Bilingual;
  history: { status: Status; note: Bilingual | null; at: string }[];
};

/** Result (guest) and details (logged in) share one layout. Guests never see the description. */
export function ShipmentView({ data, showLoginBanner }: { data: ShipmentViewData; showLoginBanner: boolean }) {
  const t = useT();
  const { lang } = useLang();
  const router = useRouter();
  return (
    <ScrollView contentContainerStyle={{ gap: 16, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 24 }}>
      <Card style={{ gap: 16, boxShadow: '0 1px 3px rgba(16,24,40,0.06)' } as ViewStyle}>
        <CodeDisplay code={data.code} />
        <StatusHero status={data.status} lastAt={data.lastAt} />
        {data.description ? (
          <View style={{ gap: 2, borderTopWidth: 1, borderTopColor: c.divider, paddingTop: 16, alignItems: 'flex-start' }}>
            <Text variant="meta" color={c.muted}>{t('description')}</Text>
            <Text variant="bodyLg" weight="500">{data.description[lang]}</Text>
          </View>
        ) : null}
      </Card>
      {showLoginBanner ? (
        <Banner text={t('bannerText')} action={<Button label={t('login')} height={44} fontSize={15} onPress={() => router.push('/login')} />} />
      ) : null}
      <Card style={{ paddingBottom: 4, gap: 16 }}>
        <Text variant="heading" style={{ fontSize: 17 }}>{t('history')}</Text>
        <Timeline entries={data.history} />
      </Card>
    </ScrollView>
  );
}

export function Skeleton({ rows = 3 }: { rows?: number }) {
  const t = useT();
  return (
    <View style={{ gap: 16, padding: 16 }}>
      <View style={{ height: 28, width: '55%', borderRadius: 8, backgroundColor: '#E4E7EC' }} />
      {Array.from({ length: rows }, (_, i) => (
        <View key={i} style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.divider, borderRadius: 18, padding: 16, gap: 12 }}>
          <View style={{ height: 18, width: '50%', borderRadius: 6, backgroundColor: c.divider }} />
          <View style={{ height: 14, width: '75%', borderRadius: 6, backgroundColor: c.chipBg }} />
          <View style={{ height: 30, width: '40%', borderRadius: 15, backgroundColor: c.chipBg }} />
        </View>
      ))}
      <Text variant="meta" color={c.muted} style={{ textAlign: 'center', fontSize: 15 }}>{t('loading')}</Text>
    </View>
  );
}

/**
 * Simulated push: a notification-styled banner that appears when an admin changes a status.
 * Works across two browser tabs because the mock store syncs through localStorage.
 */
export function PushBanner() {
  const db = useDb();
  const prefs = usePrefs();
  const customer = useCustomer();
  const router = useRouter();
  const { lang } = useLang();
  const t = useT();
  const [shown, setShown] = useState<{ code: string; status: Status } | null>(null);
  const seen = useRef<string | null>(getDb().pushEvents.at(-1)?.id ?? null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const last = db.pushEvents.at(-1);
    if (!last || last.id === seen.current) return;
    seen.current = last.id;
    if (!customer || last.customerId !== customer.id || prefs.notifOn === false) return;
    const status = db.statuses.find((s) => s.id === last.statusId);
    if (!status) return;
    setShown({ code: last.code, status });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setShown(null), 6000);
  }, [db.pushEvents, db.statuses, customer, prefs.notifOn]);
  useEffect(() => () => clearTimeout(timer.current), []);

  // Settings → "Show sample notification" fires the same banner.
  useEffect(() => {
    triggerFn = (code, status) => {
      setShown({ code, status });
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setShown(null), 6000);
    };
    return () => { triggerFn = null; };
  }, []);

  if (!shown) return null;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => { const code = shown.code; setShown(null); router.push(`/shipment/${code}`); }}
      style={{ position: 'absolute', top: 8, start: 10, end: 10, zIndex: 30, backgroundColor: 'rgba(242,244,247,0.97)', borderRadius: 20, paddingVertical: 14, paddingHorizontal: 16, gap: 6, boxShadow: '0 8px 24px rgba(16,24,40,0.22)', cursor: 'pointer' } as ViewStyle}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={theme.brand.logoIcon} size={14} color="#fff" stroke={2.4} />
        </View>
        <Text variant="meta" weight="600" color={c.text3} style={{ flex: 1 }}>{lang === 'ar' ? theme.brand.nameAr : theme.brand.nameEn}</Text>
        <Text variant="meta" color={c.muted}>{t('notifNow')}</Text>
      </View>
      <Text variant="bodyLg" style={{ fontSize: 16, lineHeight: 22 }}>{t('notifInApp', { code: shown.code, status: statusName(shown.status, lang) })}</Text>
      <Text variant="meta" color={c.text3} style={{ fontSize: 15 }}>{t('notifTap')}</Text>
    </Pressable>
  );
}
let triggerFn: ((code: string, status: Status) => void) | null = null;
export const triggerPush = (code: string, status: Status) => triggerFn?.(code, status);
