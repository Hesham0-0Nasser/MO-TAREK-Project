import React from 'react';
import { Modal as RNModal, Pressable, View, useWindowDimensions, type ViewStyle } from 'react-native';
import { useAdminT, useLang } from '../../i18n';
import { c, theme } from '../../theme';
import { Icon } from '../Icon';
import { Button, Text } from '../ui';

export const DESKTOP = 960;
export const useIsDesktop = () => useWindowDimensions().width >= DESKTOP;
export const fontStyle = (lang: string) => ({ fontFamily: lang === 'ar' ? theme.font.ar : theme.font.en });

// ---------- toast (admin) ----------
export function AdminToast({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', bottom: 32, start: 0, end: 0, alignItems: 'center', zIndex: 100 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: c.ink, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16, ...theme.shadow.overlay } as ViewStyle}>
        <Icon name="check" size={20} color="#fff" />
        <Text color="#fff" weight="500" style={{ fontSize: 15 }}>{text}</Text>
      </View>
    </View>
  );
}

// ---------- modal ----------
export function Modal({ title, onClose, children, width = 520 }: { title: string; onClose: () => void; children: React.ReactNode; width?: number }) {
  const { dir } = useLang();
  return (
    <RNModal transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(16,24,40,0.45)', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <Pressable {...({ dir } as object)} onPress={() => {}} style={{ width: '100%', maxWidth: width, maxHeight: '92%', backgroundColor: '#fff', borderRadius: 20, padding: 24, gap: 18, ...theme.shadow.overlay, cursor: 'default' } as unknown as ViewStyle}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <Text variant="heading" style={{ fontSize: 20 }}>{title}</Text>
            <Pressable accessibilityRole="button" onPress={onClose} style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center', cursor: 'pointer' } as ViewStyle}><Icon name="x" size={20} color={c.muted} /></Pressable>
          </View>
          {children}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

export function ModalActions({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>{children}</View>;
}

// ---------- native select (web <select>) ----------
export function Select({ value, onChange, options, minWidth = 180 }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; minWidth?: number }) {
  const { lang, dir } = useLang();
  return React.createElement(
    'select',
    {
      value, dir, onChange: (e: { target: { value: string } }) => onChange(e.target.value),
      style: { height: 48, minWidth, borderRadius: 12, border: `1.5px solid ${c.border}`, background: '#fff', padding: '0 12px', fontSize: 16, color: c.ink, ...fontStyle(lang), outline: 'none', cursor: 'pointer' },
    },
    options.map((o) => React.createElement('option', { key: o.value, value: o.value }, o.label)),
  );
}

// ---------- table ----------
export type Col<T> = { key: string; header: string; flex?: number; width?: number; render: (row: T) => React.ReactNode };
export function Table<T>({ cols, rows, onRowPress, empty, rowKey }: { cols: Col<T>[]; rows: T[]; onRowPress?: (r: T) => void; empty?: string; rowKey: (r: T) => string }) {
  const desktop = useIsDesktop();
  const cell = (col: Col<T>) => (col.width ? { width: col.width } : { flex: col.flex ?? 1 });
  return (
    <View style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: c.divider, borderRadius: 16, overflow: 'hidden' }}>
      {desktop ? (
        <View style={{ flexDirection: 'row', gap: 16, paddingVertical: 12, paddingHorizontal: 20, backgroundColor: '#F9FAFB', borderBottomWidth: 1, borderBottomColor: c.divider }}>
          {cols.map((col) => <View key={col.key} style={cell(col)}><Text variant="meta" weight="600" color={c.text3} style={{ fontSize: 13 }}>{col.header}</Text></View>)}
        </View>
      ) : null}
      {rows.map((r, i) => (
        <Pressable
          key={rowKey(r)} accessibilityRole={onRowPress ? 'button' : undefined} onPress={onRowPress ? () => onRowPress(r) : undefined}
          style={(st) => { const hovered = (st as { hovered?: boolean }).hovered; return ({ flexDirection: desktop ? 'row' : 'column', gap: desktop ? 16 : 6, alignItems: desktop ? 'center' : 'flex-start', paddingVertical: 14, paddingHorizontal: 20, borderTopWidth: i === 0 && !desktop ? 0 : i === 0 ? 0 : 1, borderTopColor: '#F2F4F7', backgroundColor: hovered && onRowPress ? '#F9FAFB' : '#fff', cursor: onRowPress ? 'pointer' : 'default' } as unknown as ViewStyle); }}
        >
          {cols.map((col) => <View key={col.key} style={desktop ? { ...cell(col), alignItems: 'flex-start' } : { alignItems: 'flex-start' }}>{col.render(r)}</View>)}
        </Pressable>
      ))}
      {rows.length === 0 && empty ? <View style={{ padding: 32, alignItems: 'center' }}><Text color={c.muted}>{empty}</Text></View> : null}
    </View>
  );
}

export function Pager({ page, pages, total, size, onPage }: { page: number; pages: number; total: number; size: number; onPage: (p: number) => void }) {
  const t = useAdminT();
  if (total === 0) return null;
  const a = (page - 1) * size + 1, b = Math.min(page * size, total);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
      <Text variant="meta" color={c.text3}>{t('showing', { a, b, n: total })}</Text>
      <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
        <Button variant="secondary" height={40} fontSize={14} label={t('prev')} disabled={page <= 1} onPress={() => onPage(page - 1)} />
        {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
          <Pressable key={n} accessibilityRole="button" onPress={() => onPage(n)} style={{ width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: n === page ? c.ink : c.border, backgroundColor: n === page ? c.ink : '#fff', cursor: 'pointer' } as ViewStyle}>
            <Text variant="meta" weight="600" color={n === page ? '#fff' : c.text2}>{n}</Text>
          </Pressable>
        ))}
        <Button variant="secondary" height={40} fontSize={14} label={t('next')} disabled={page >= pages} onPress={() => onPage(page + 1)} />
      </View>
    </View>
  );
}

export function PageTitle({ title, sub, actions }: { title: string; sub?: string; actions?: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
      <View style={{ gap: 4, flexShrink: 1 }}>
        <Text variant="display" style={{ fontSize: 26, lineHeight: 34 }}>{title}</Text>
        {sub ? <Text color={c.text3} style={{ lineHeight: 24 }}>{sub}</Text> : null}
      </View>
      {actions ? <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>{actions}</View> : null}
    </View>
  );
}

export function useCopy(show: (text: string) => void) {
  const t = useAdminT();
  return async (value: string) => {
    try { await navigator.clipboard.writeText(value); } catch { /* clipboard blocked */ }
    show(t('copied'));
  };
}
