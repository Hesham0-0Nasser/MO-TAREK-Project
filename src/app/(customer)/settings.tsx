import { Redirect, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, View, type ViewStyle } from 'react-native';
import { DemoNote, SettingsRow, TabBar, useToast } from '../../components/chrome';
import { triggerPush } from '../../components/customerParts';
import { Icon } from '../../components/Icon';
import { Segmented, Switch, Text } from '../../components/ui';
import { useCustomer } from '../../hooks/useCustomer';
import { useLang, useT } from '../../i18n';
import { logout } from '../../mock/api';
import { getDb, setPrefs, usePrefs } from '../../mock/store';
import { theme, c } from '../../theme';

export default function Settings() {
  const t = useT();
  const { lang, rtl, setLang } = useLang();
  const router = useRouter();
  const toast = useToast();
  const customer = useCustomer();
  const prefs = usePrefs();
  if (!customer) return <Redirect href="/login" />;
  const notifOn = prefs.notifOn !== false;
  const name = customer.name[lang];

  const sample = () => {
    const db = getDb();
    const s = db.shipments.find((x) => x.customerId === customer.id) ?? db.shipments[0];
    const status = db.statuses.find((x) => x.id === s.history[s.history.length - 1].statusId)!;
    triggerPush(s.code, status);
  };
  const Divider = () => <View style={{ height: 1, backgroundColor: c.divider, marginStart: 52 }} />;
  const card = { backgroundColor: '#fff', borderWidth: 1, borderColor: c.divider, borderRadius: 18, overflow: 'hidden' } as ViewStyle;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ gap: 16, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 }}>
        <Text variant="display" style={{ fontSize: 26, lineHeight: 34, marginTop: 8, marginHorizontal: 4 }}>{t('settingsTitle')}</Text>
        <View style={[card, { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 }]}>
          <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 20 }} weight="700" color={c.primary}>{name.charAt(0)}</Text>
          </View>
          <View style={{ gap: 2 }}>
            <Text variant="bodyLg" weight="700">{name}</Text>
            <Text mono color={c.text3} style={{ fontSize: 15 }}>{customer.mobile}</Text>
          </View>
        </View>

        <View style={[card, { padding: 16, gap: 12 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Icon name="globe" size={22} color={c.text3} />
            <Text variant="bodyLg" weight="600">{t('language')}</Text>
          </View>
          <Segmented value={lang} onChange={setLang} options={[{ value: 'ar', label: 'العربية', font: theme.font.ar }, { value: 'en', label: 'English', font: theme.font.en }]} />
        </View>

        <View style={card}>
          <SettingsRow icon="bell" label={t('notifications')} sub={t('notifSub')} onPress={() => setPrefs({ notifOn: !notifOn })} right={<Switch on={notifOn} onToggle={() => setPrefs({ notifOn: !notifOn })} />} />
          <Divider />
          <SettingsRow icon="lock" label={t('changePw')} onPress={() => router.push('/change-password')} right={<Icon name={rtl ? 'chevL' : 'chevR'} size={20} color={c.placeholder} />} />
          <Divider />
          <SettingsRow icon="phone" label={t('contact')} onPress={() => router.push('/forgot?mode=contact')} right={<Icon name={rtl ? 'chevL' : 'chevR'} size={20} color={c.placeholder} />} />
        </View>

        <View style={card}>
          <SettingsRow icon="logout" label={t('logout')} color={c.danger} onPress={() => { logout(); router.replace('/'); toast(t('loggedOut')); }} />
        </View>

        <View style={{ gap: 4, alignItems: 'center', paddingTop: 8 }}>
          <Pressable accessibilityRole="button" onPress={sample} style={{ paddingVertical: 6, cursor: 'pointer' } as ViewStyle}>
            <Text variant="meta" color={c.primary} weight="600" style={{ fontSize: 13, textDecorationLine: 'underline' }}>{t('pushSample')}</Text>
          </Pressable>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            {(['offline', 'session', 'error'] as const).map((k) => (
              <Pressable key={k} accessibilityRole="link" onPress={() => router.push(`/state/${k}`)} style={{ paddingVertical: 6, cursor: 'pointer' } as ViewStyle}>
                <Text variant="meta" color={c.muted} style={{ fontSize: 13, textDecorationLine: 'underline' }}>{{ offline: t('noInternetTitle'), session: t('sessionTitle'), error: t('errorTitle') }[k]}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <DemoNote />
      </ScrollView>
      <TabBar active="settings" />
    </View>
  );
}
