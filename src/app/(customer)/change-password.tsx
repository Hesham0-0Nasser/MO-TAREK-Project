import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { HeaderBar, useToast } from '../../components/chrome';
import { Icon } from '../../components/Icon';
import { Button, Field, Input, PasswordInput, Text } from '../../components/ui';
import { useCustomer } from '../../hooks/useCustomer';
import { useT } from '../../i18n';
import { changePassword } from '../../mock/api';
import { c } from '../../theme';

// Forced after an admin reset (temp=1, no back button) or opened from Settings.
export default function ChangePassword() {
  const { temp } = useLocalSearchParams<{ temp?: string }>();
  const isTemp = temp === '1';
  const t = useT();
  const router = useRouter();
  const toast = useToast();
  const customer = useCustomer();
  const [np, setNp] = useState('');
  const [cp, setCp] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!customer) return <Redirect href="/login" />;

  let lvl = 0;
  if (np.length > 0) lvl = 1;
  if (np.length >= 8 && /\d/.test(np)) lvl = 2;
  if (np.length >= 10 && /\d/.test(np) && /[A-Z]/.test(np)) lvl = 3;
  const lc = ['#E4E7EC', '#D92D20', '#E08A0B', '#16A34A'][lvl];
  const mismatch = !!cp && cp !== np;
  const valid = np.length >= 8 && np === cp;

  const save = async () => {
    if (!valid) return;
    setBusy(true);
    await changePassword(customer.id, np);
    toast(t('pwSaved'));
    router.replace('/shipments');
  };

  return (
    <View style={{ flex: 1 }}>
      <HeaderBar title={isTemp ? t('tempTitle') : t('changePwTitle')} onBack={isTemp ? undefined : () => router.back()} />
      <ScrollView contentContainerStyle={{ gap: 20, paddingHorizontal: 20, paddingTop: 4, paddingBottom: 24 }}>
        {isTemp ? (
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start', padding: 16, borderRadius: 14, backgroundColor: c.warnBg }}>
            <Icon name="info" size={22} color="#B54708" />
            <Text color={c.warnFg} style={{ flex: 1, lineHeight: 24 }}>{t('tempText')}</Text>
          </View>
        ) : null}
        <Field label={t('newPw')}>
          <PasswordInput value={np} onChangeText={setNp} show={show} onToggle={() => setShow(!show)} showLabel={t('show')} hideLabel={t('hide')} />
          <View style={{ flexDirection: 'row', gap: 6, paddingTop: 4 }}>
            {[1, 2, 3].map((i) => <View key={i} style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: lvl >= i ? lc : '#E4E7EC' }} />)}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
            <Text variant="meta" color={c.muted}>{t('rule')}</Text>
            <Text variant="meta" weight="700" color={lc}>{['', t('weak'), t('fair'), t('strong')][lvl]}</Text>
          </View>
        </Field>
        <Field label={t('confirmPw')} error={mismatch ? t('mismatch') : undefined}>
          <Input secure={!show} value={cp} onChangeText={setCp} error={mismatch} onSubmit={save} />
        </Field>
        <Button label={t('savePw')} onPress={save} disabled={!valid} loading={busy} />
      </ScrollView>
    </View>
  );
}
