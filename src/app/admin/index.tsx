import { Redirect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useAdmin } from '../../components/admin/Shell';
import { Icon } from '../../components/Icon';
import { Button, Card, Field, Input, PasswordInput, Segmented, Text } from '../../components/ui';
import { DemoBadge } from '../../components/chrome';
import { useStaff } from '../../hooks/useCustomer';
import { useAdminT, useLang } from '../../i18n';
import { adminLogin } from '../../mock/api';
import { c, theme } from '../../theme';

export default function AdminLogin() {
  const t = useAdminT();
  const { lang, setLang, rtl } = useLang();
  const router = useRouter();
  const staff = useStaff();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState<'loginErr' | 'loginWrong' | ''>('');
  const [busy, setBusy] = useState(false);

  if (staff) return <Redirect href="/admin/shipments" />;

  const submit = async () => {
    if (!email.trim() || !pw) return setErr('loginErr');
    setBusy(true);
    try { await adminLogin(email, pw); router.replace('/admin/shipments'); } catch { setErr('loginWrong'); setBusy(false); }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20, gap: 20 }}>
      <View style={{ width: '100%', maxWidth: 200 }}>
        <Segmented height={36} value={lang} onChange={setLang} options={[{ value: 'ar', label: 'العربية', font: theme.font.ar }, { value: 'en', label: 'English', font: theme.font.en }]} />
      </View>
      <Card style={{ width: '100%', maxWidth: 440, padding: 32, gap: 20, boxShadow: '0 8px 24px rgba(16,24,40,0.08)' } as object}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}><Icon name={theme.brand.logoIcon} size={24} color="#fff" /></View>
          <Text variant="bodyLg" weight="700" style={{ flex: 1, fontSize: 18 }}>{rtl ? theme.brand.nameAr : theme.brand.nameEn}</Text>
          <DemoBadge />
        </View>
        <View style={{ gap: 4 }}>
          <Text variant="display" style={{ fontSize: 26 }}>{t('loginTitle')}</Text>
          <Text color={c.text3}>{t('loginSub')}</Text>
        </View>
        <Field label={t('emailOrMobile')}>
          <Input ltr value={email} keyboardType="email-address" placeholder="admin@demo.com" error={!!err} onChangeText={(v) => { setEmail(v); setErr(''); }} onSubmit={submit} />
        </Field>
        <Field label={t('password')}>
          <PasswordInput value={pw} onChangeText={(v) => { setPw(v); setErr(''); }} show={show} onToggle={() => setShow(!show)} showLabel={lang === 'ar' ? 'إظهار' : 'Show'} hideLabel={lang === 'ar' ? 'إخفاء' : 'Hide'} error={!!err} onSubmit={submit} />
        </Field>
        {err ? (
          <View style={{ flexDirection: 'row', gap: 10, padding: 12, borderRadius: 12, backgroundColor: c.dangerBg }}>
            <Icon name="alert" size={20} color={c.danger} />
            <Text color={c.danger} style={{ flex: 1, fontSize: 15 }}>{t(err)}</Text>
          </View>
        ) : null}
        <Button label={t('login')} onPress={submit} loading={busy} />
        <View style={{ padding: 12, borderRadius: 12, backgroundColor: c.chipBg, gap: 8, alignItems: 'flex-start' }}>
          <Text variant="meta" color={c.text2} style={{ fontSize: 13 }}>{t('demoLoginHint')}</Text>
          <Button variant="secondary" label={t('fillDemo')} height={36} fontSize={13} onPress={() => { setEmail('admin@demo.com'); setPw('demo1234'); setErr(''); }} />
        </View>
      </Card>
      <Text variant="meta" color={c.muted} style={{ fontSize: 13 }}>{t('demoNote')}</Text>
      <Button variant="text" label={t('openApp')} height={40} fontSize={14} onPress={() => router.push('/')} />
    </ScrollView>
  );
}
