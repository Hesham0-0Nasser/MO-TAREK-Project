import React from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';
import { useLang, useT } from '../i18n';
import type { Lang } from '../i18n/strings';
import { formatLast, formatWhen } from '../mock/format';
import type { Bilingual, Status } from '../mock/types';
import { theme, c } from '../theme';
import { Icon } from './Icon';
import { Text } from './ui';

export const statusName = (s: Pick<Status, 'nameAr' | 'nameEn'>, lang: Lang) => (lang === 'ar' ? s.nameAr : s.nameEn);

/** Small pill (lists, tables). Long names wrap; the badge grows in height, never truncates. */
export function StatusBadge({ status, size = 'sm' }: { status: Status; size?: 'sm' | 'xs' }) {
  const { lang } = useLang();
  const tone = theme.tone[status.tone];
  return (
    <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: size === 'xs' ? 28 : 32, paddingVertical: 2, paddingHorizontal: 12, borderRadius: 16, backgroundColor: tone.bg, maxWidth: '100%' }}>
      <Icon name={status.icon} size={size === 'xs' ? 15 : 18} color={tone.fg} />
      <Text variant="bodyLg" color={tone.fg} style={{ fontSize: size === 'xs' ? 14 : 15, lineHeight: 20, flexShrink: 1 }}>{statusName(status, lang)}</Text>
    </View>
  );
}

/** The hero: the current status is the most visible element on every shipment screen. */
export function StatusHero({ status, lastAt }: { status: Status; lastAt: string }) {
  const { lang } = useLang();
  const t = useT();
  const tone = theme.tone[status.tone];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: theme.radius.lg, backgroundColor: tone.bg }}>
      <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={status.icon} size={28} color={tone.fg} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="title" color={tone.fg}>{statusName(status, lang)}</Text>
        <Text variant="body" color={c.text2} style={{ fontSize: 15 }}>{t('lastUpdate')}: {formatWhen(lastAt, lang)}</Text>
      </View>
    </View>
  );
}

export function ShipmentCard({ code, description, status, lastAt, onPress }: { code: string; description: string; status: Status; lastAt: string; onPress: () => void }) {
  const { lang, rtl } = useLang();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ backgroundColor: pressed ? '#F9FAFB' : c.surface, borderWidth: 1, borderColor: c.divider, borderRadius: 18, padding: 16, gap: 12, boxShadow: '0 1px 2px rgba(16,24,40,0.05)', cursor: 'pointer' } as ViewStyle)}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <View style={{ gap: 2, flexShrink: 1 }}>
          <Text mono weight="600">{code}</Text>
          <Text color={c.text3}>{description}</Text>
        </View>
        <Icon name={rtl ? 'chevL' : 'chevR'} size={20} color={c.placeholder} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <StatusBadge status={status} />
        <Text variant="meta" color={c.muted}>{formatLast(lastAt, lang)}</Text>
      </View>
    </Pressable>
  );
}

export type TimelineEntry = { status: Status; note: Bilingual | null; at: string };

/** Vertical timeline, newest first. The rail sits on the start side and mirrors in RTL. */
export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  const { lang } = useLang();
  const t = useT();
  const list = [...entries].reverse();
  return (
    <View>
      {list.map((e, i) => {
        const cur = i === 0, tone = theme.tone[e.status.tone], last = i === list.length - 1;
        return (
          <View key={i} style={{ flexDirection: 'row', gap: 12, alignItems: 'stretch' }}>
            <View style={{ width: 36, alignItems: 'center' }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: cur ? tone.solid : c.chipBg, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={e.status.icon} size={18} color={cur ? '#fff' : c.placeholder} />
              </View>
              <View style={{ flex: 1, width: 2, minHeight: 12, marginVertical: 4, backgroundColor: last ? 'transparent' : '#E4E7EC' }} />
            </View>
            <View style={{ flex: 1, minWidth: 0, paddingTop: 6, paddingBottom: 20, gap: 2, alignItems: 'flex-start' }}>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <Text variant="bodyLg" weight={cur ? '700' : '500'} color={cur ? c.ink : c.text3} style={{ fontSize: 17 }}>{statusName(e.status, lang)}</Text>
                {cur ? (
                  <View style={{ height: 24, paddingHorizontal: 10, borderRadius: 12, backgroundColor: tone.bg, justifyContent: 'center' }}>
                    <Text variant="meta" weight="700" color={tone.fg} style={{ fontSize: 13 }}>{t('current')}</Text>
                  </View>
                ) : null}
              </View>
              <Text variant="meta" color={c.muted} style={{ fontSize: 15 }}>{formatWhen(e.at, lang, ' · ')}</Text>
              {e.note ? (
                <View style={{ backgroundColor: c.canvas, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, marginTop: 6 }}>
                  <Text variant="body" color={c.text2} style={{ fontSize: 15, lineHeight: 22 }}>{e.note[lang]}</Text>
                </View>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
