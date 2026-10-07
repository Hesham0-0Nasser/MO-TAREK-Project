import { usePathname, useRouter } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, useWindowDimensions, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLang, useT } from '../i18n';
import { resetDemoData } from '../mock/store';
import { theme, c } from '../theme';
import { Icon } from './Icon';
import { Button, Text } from './ui';

export const WIDE_BREAKPOINT = 720;
export const BASE = (process.env.EXPO_BASE_URL ?? '').replace(/\/$/, '');

// ---------- toast ----------
const ToastContext = createContext<(text: string) => void>(() => {});
export const useToast = () => useContext(ToastContext);

export function ToastHost({ children }: { children: React.ReactNode }) {
  const [text, setText] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const show = useCallback((msg: string) => {
    clearTimeout(timer.current);
    setText(msg);
    timer.current = setTimeout(() => setText(null), 2200);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      {text ? (
        <View pointerEvents="none" style={{ position: 'absolute', start: 16, end: 16, bottom: 96, alignItems: 'center', zIndex: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: c.ink, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16, ...theme.shadow.overlay } as ViewStyle}>
            <Icon name="check" size={20} color="#fff" />
            <Text color="#fff" weight="500" style={{ fontSize: 15 }}>{text}</Text>
          </View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

// ---------- header + tab bar ----------
export function HeaderBar({ title, onBack }: { title?: string; onBack?: () => void }) {
  const { rtl } = useLang();
  const t = useT();
  return (
    <View style={{ height: 56, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8 }}>
      {onBack ? (
        <Pressable accessibilityRole="button" accessibilityLabel={t('backLabel')} onPress={onBack} style={({ pressed }) => ({ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? '#E4E7EC' : 'transparent', cursor: 'pointer' } as ViewStyle)}>
          <Icon name={rtl ? 'chevR' : 'chevL'} size={26} />
        </Pressable>
      ) : null}
      {title ? <Text variant="heading" style={{ paddingHorizontal: 12 }}>{title}</Text> : null}
    </View>
  );
}

export function TabBar({ active }: { active: 'shipments' | 'settings' }) {
  const router = useRouter();
  const t = useT();
  const tabs = [
    { key: 'shipments', icon: 'package', label: t('tabShipments'), href: '/shipments' },
    { key: 'settings', icon: 'sliders', label: t('tabSettings'), href: '/settings' },
  ] as const;
  return (
    <View style={{ height: theme.size.tabBar, flexDirection: 'row', backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.divider }}>
      {tabs.map((tab) => {
        const on = tab.key === active;
        return (
          <Pressable key={tab.key} accessibilityRole="tab" accessibilityState={{ selected: on }} onPress={() => !on && router.replace(tab.href)} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer' } as ViewStyle}>
            <Icon name={tab.icon} size={24} color={on ? c.primary : c.muted} />
            <Text variant="meta" weight="600" color={on ? c.primary : c.muted} style={{ fontSize: 13 }}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function StateView({ icon, title, text, button, onPress }: { icon: string; title: string; text: string; button: string; onPress: () => void }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 28, paddingTop: 24, paddingBottom: 48 }}>
      <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: c.surface, borderWidth: 1, borderColor: c.divider, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={36} color={c.text3} />
      </View>
      <Text variant="title" style={{ fontSize: 22, textAlign: 'center' }}>{title}</Text>
      <Text color={c.text3} style={{ textAlign: 'center' }}>{text}</Text>
      <View style={{ width: '100%', paddingTop: 8 }}><Button label={button} onPress={onPress} /></View>
    </View>
  );
}

export function SettingsRow({ icon, label, sub, right, onPress, color = c.ink }: { icon: string; label: string; sub?: string; right?: React.ReactNode; onPress?: () => void; color?: string }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ minHeight: sub ? 72 : 64, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 16, backgroundColor: pressed ? '#F9FAFB' : c.surface, cursor: 'pointer' } as ViewStyle)}>
      <Icon name={icon} size={22} color={color === c.ink ? c.text3 : color} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyLg" color={color}>{label}</Text>
        {sub ? <Text variant="meta" color={c.muted}>{sub}</Text> : null}
      </View>
      {right}
    </Pressable>
  );
}

// ---------- demo chrome ----------
export function DemoBadge() {
  const t = useT();
  return (
    <View style={{ height: 22, paddingHorizontal: 8, borderRadius: 11, backgroundColor: c.warnBg, justifyContent: 'center' }}>
      <Text variant="meta" weight="700" color="#B54708" style={{ fontSize: 11, letterSpacing: 0.6 }}>{t('demoBadge').toUpperCase()}</Text>
    </View>
  );
}

export function DemoNote({ onReset }: { onReset?: () => void }) {
  const t = useT();
  const toast = useToast();
  return (
    <View style={{ alignItems: 'center', gap: 4, paddingVertical: 8 }}>
      <Text variant="meta" color={c.muted} style={{ fontSize: 13, textAlign: 'center' }}>{t('demoNote')}</Text>
      <Pressable accessibilityRole="button" onPress={() => { resetDemoData(); onReset?.(); toast(t('resetDone')); }} style={{ paddingVertical: 6, cursor: 'pointer' } as ViewStyle}>
        <Text variant="meta" color={c.primary} weight="600" style={{ fontSize: 13, textDecorationLine: 'underline' }}>{t('resetDemo')}</Text>
      </Pressable>
    </View>
  );
}

// ---------- phone frame ----------
const web = Platform.OS === 'web';
// react-native-web understands `dir`; RN's types don't.
const dirProp = (dir: 'rtl' | 'ltr') => ({ dir } as object);
export function PhoneFrame({ children }: { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions();
  const { dir, font } = useLang();
  const t = useT();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const wide = web && width >= WIDE_BREAKPOINT;

  if (!wide) {
    return (
      <View {...dirProp(dir)} style={{ flex: 1, backgroundColor: c.canvas, paddingTop: insets.top, paddingBottom: insets.bottom }}>
        {children}
      </View>
    );
  }
  const frameH = Math.min(780, Math.max(560, height - 150));
  return (
    <View style={{ flex: 1, backgroundColor: c.stage }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingVertical: 14, paddingHorizontal: 32, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E4E7EC' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}><Icon name={theme.brand.logoIcon} size={20} color="#fff" /></View>
          <View>
            <Text variant="bodyLg" style={{ fontSize: 16 }}>{theme.brand.nameEn} · Customer app</Text>
            <Text variant="meta" color={c.muted} style={{ fontSize: 13 }}>Interactive demo · sample data only</Text>
          </View>
          <DemoBadge />
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable style={{ height: 40, paddingHorizontal: 16, borderRadius: 10, backgroundColor: c.ink, justifyContent: 'center' } as ViewStyle}><Text variant="meta" weight="600" color="#fff" style={{ fontFamily: theme.font.en }}>Customer app</Text></Pressable>
          <Pressable accessibilityRole="link" onPress={() => router.push('/admin')} style={{ height: 40, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, borderColor: c.border, justifyContent: 'center', cursor: 'pointer' } as ViewStyle}><Text variant="meta" weight="600" style={{ fontFamily: theme.font.en }}>Admin dashboard</Text></Pressable>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingVertical: 28, gap: 14 }}>
        <View style={{ padding: 10, borderRadius: 50, backgroundColor: '#0F1728', boxShadow: '0 20px 50px rgba(16,24,40,0.18)' } as ViewStyle}>
          <View {...dirProp(dir)} style={{ width: 380, height: frameH, borderRadius: 40, overflow: 'hidden', backgroundColor: c.canvas, position: 'relative' }}>
            <View {...dirProp("ltr")} style={{ height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 30 }}>
              <Text variant="bodyLg" style={{ fontFamily: theme.font.en, fontSize: 15 }}>9:41</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Icon name="wifi" size={17} stroke={2.2} />
                <View style={{ width: 25, height: 12, borderWidth: 1.5, borderColor: c.ink, borderRadius: 4, padding: 1.5 }}><View style={{ width: '70%', height: '100%', backgroundColor: c.ink, borderRadius: 1 }} /></View>
              </View>
            </View>
            <View style={{ flex: 1, minHeight: 0 }}>{children}</View>
            <View style={{ height: 24, alignItems: 'center', justifyContent: 'center' }}><View style={{ width: 120, height: 5, borderRadius: 3, backgroundColor: c.ink }} /></View>
          </View>
        </View>
        <DemoNoteStage />
      </ScrollView>
    </View>
  );
}

function DemoNoteStage() {
  const t = useT();
  return (
    <View style={{ alignItems: 'center', gap: 4 }}>
      <Text variant="meta" color={c.muted} style={{ fontSize: 13, fontFamily: theme.font.en }}>Interactive demo. Sample data only.</Text>
      <Pressable accessibilityRole="button" onPress={() => { resetDemoData(); }} style={{ paddingVertical: 4, cursor: 'pointer' } as ViewStyle}>
        <Text variant="meta" color={c.primary} weight="600" style={{ fontSize: 13, textDecorationLine: 'underline', fontFamily: theme.font.en }}>Reset demo data</Text>
      </Pressable>
    </View>
  );
}
