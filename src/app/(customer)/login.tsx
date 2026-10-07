import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { HeaderBar } from '../../components/chrome';
import { Icon } from '../../components/Icon';
import { Button, Field, Input, PasswordInput, Text } from '../../components/ui';
import { useT } from '../../i18n';
import { login } from '../../mock/api';
import { c } from '../../theme';

export default function Login() {
  const t = useT();
  const router = useRouter();
  const [mobile, setMobile] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState<'mobileErr' | 'pwErr' | 'loginErr' | ''>('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!mobile.trim()) return setErr('mobileErr');
    if (!pw) return setErr('pwErr');
    setBusy(true);
    try {
      const r = await login(mobile, pw);
      router.replace(r.mustChange ? '/change-password?temp=1' : '/shipments');
    } catch {
      setErr('loginErr');
      setBusy(false);
    }
  };
  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <View style={{ flex: 1 }}>
      <HeaderBar title={t('loginTitle')} onBack={back} />
      <ScrollView contentContainerStyle={{ gap: 20, paddingHorizontal: 20, paddingTop: 4, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        <Text color={c.text3}>{t('loginSub')}</Text>
        <Field label={t('mobile')}>
          <Input ltr keyboardType="phone-pad" value={mobile} placeholder="05XXXXXXXX" error={err === 'mobileErr' || err === 'loginErr'} onChangeText={(v) => { setMobile(v.replace(/[^\d+ ]/g, '').slice(0, 14)); setErr(''); }} onSubmit={submit} />
        </Field>
        <Field label={t('password')}>
          <PasswordInput value={pw} onChangeText={(v) => { setPw(v); setErr(''); }} show={show} onToggle={() => setShow(!show)} showLabel={t('show')} hideLabel={t('hide')} error={err === 'pwErr' || err === 'loginErr'} onSubmit={submit} />
        </Field>
        {err ? (
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start', padding: 14, borderRadius: 12, backgroundColor: c.dangerBg }}>
            <Icon name="alert" size={20} color={c.danger} />
            <Text color={c.danger} style={{ flex: 1, fontSize: 15, lineHeight: 22 }}>{t(err)}</Text>
          </View>
        ) : null}
        <Button label={t('login')} onPress={submit} loading={busy} />
        <View style={{ alignSelf: 'center' }}><Button variant="text" label={t('forgot')} height={48} fontSize={16} onPress={() => router.push('/forgot')} /></View>
        <View style={{ padding: 12, borderRadius: 12, backgroundColor: c.chipBg, gap: 8, alignItems: 'flex-start' }}>
          <Text variant="meta" color={c.text2} style={{ fontSize: 13, lineHeight: 18 }}>{t('demoLoginHint')}</Text>
          <Button variant="secondary" label="0551234567 / demo1234" height={36} fontSize={13} onPress={() => { setMobile('0551234567'); setPw('demo1234'); setErr(''); }} />
        </View>
      </ScrollView>
    </View>
  );
}
