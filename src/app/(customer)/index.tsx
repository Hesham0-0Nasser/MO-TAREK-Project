import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, View, useWindowDimensions, type ViewStyle } from 'react-native';
import { DemoBadge, DemoNote, WIDE_BREAKPOINT } from '../../components/chrome';
import { Icon } from '../../components/Icon';
import { Button, Input, SoftButton, Text } from '../../components/ui';
import { useLang, useT } from '../../i18n';
import { useCustomer } from '../../hooks/useCustomer';
import { Redirect } from 'expo-router';
import { theme, c } from '../../theme';

export default function Home() {
  const t = useT();
  const { lang, rtl, setLang } = useLang();
  const router = useRouter();
  const customer = useCustomer();
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const [err, setErr] = useState(false);

  if (customer) return <Redirect href={customer.mustChange ? '/change-password?temp=1' : '/shipments'} />;

  const track = () => {
    const q = query.trim().toUpperCase();
    if (!q) return setErr(true);
    router.push(`/result/${q}`);
  };
  const paste = async () => {
    let text = '';
    try { text = await Clipboard.getStringAsync(); } catch { /* blocked */ }
    setQuery((text || 'AB7K2M9XQ4').toUpperCase().replace(/\s/g, '').slice(0, 12));
    setErr(false);
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, gap: 24, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }} keyboardShouldPersistTaps="handled">
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 56 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 }}>
          <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={theme.brand.logoIcon} size={22} color="#fff" />
          </View>
          <Text variant="bodyLg" weight="700" style={{ flexShrink: 1 }}>{rtl ? theme.brand.nameAr : theme.brand.nameEn}</Text>
          {width < WIDE_BREAKPOINT ? <DemoBadge /> : null}
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => setLang(lang === 'ar' ? 'en' : 'ar')}
          style={({ pressed }) => ({ height: 48, paddingHorizontal: 16, borderRadius: 24, borderWidth: 1.5, borderColor: c.border, backgroundColor: pressed ? c.chipBg : '#fff', flexDirection: 'row', alignItems: 'center', gap: 8, cursor: 'pointer' } as ViewStyle)}
        >
          <Icon name="globe" size={20} />
          <Text variant="bodyLg" style={{ fontSize: 15, fontFamily: rtl ? theme.font.en : theme.font.ar }}>{t('langSwitch')}</Text>
        </Pressable>
      </View>

      <View style={{ gap: 8, paddingTop: 16 }}>
        <Text variant="display">{t('homeTitle')}</Text>
        <Text color={c.text3} style={{ lineHeight: 26 }}>{t('homeSub')}</Text>
      </View>

      <View style={{ gap: 12 }}>
        <Text variant="meta" weight="600" color={c.text2} style={{ fontSize: 15 }}>{t('numLabel')}</Text>
        <Input
          mono height={64} value={query} error={err} placeholder={t('numPh')} onSubmit={track}
          onChangeText={(v) => { setQuery(v.toUpperCase().replace(/\s/g, '').slice(0, 12)); setErr(false); }}
          endAction={<SoftButton icon="paste" label={t('paste')} onPress={paste} />}
        />
        {err ? <Text variant="meta" color={c.danger} style={{ fontSize: 15 }}>{t('emptyNum')}</Text> : null}
        <Button label={t('track')} icon="search" onPress={track} />
      </View>

      <View style={{ flex: 1 }} />

      <View style={{ gap: 12, padding: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: c.divider, borderRadius: theme.radius.lg }}>
        <Text color={c.text3} style={{ textAlign: 'center', lineHeight: 24 }}>{t('haveAccount')}</Text>
        <Button label={t('login')} variant="secondary" onPress={() => router.push('/login')} />
      </View>
      {width < WIDE_BREAKPOINT ? <DemoNote /> : null}
    </ScrollView>
  );
}
