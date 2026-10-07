import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Linking, ScrollView, View } from 'react-native';
import { HeaderBar, useToast } from '../../components/chrome';
import { Icon } from '../../components/Icon';
import { Button, Text } from '../../components/ui';
import { useT } from '../../i18n';
import { useDb } from '../../mock/store';
import { c } from '../../theme';

// "Forgot password?" (and Settings → Contact) both land here (PRD 5.6).
export default function Forgot() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const t = useT();
  const router = useRouter();
  const toast = useToast();
  const number = useDb().settings.contactNumber;
  const contact = mode === 'contact';
  const digits = number.replace(/\D/g, '');
  const back = () => (router.canGoBack() ? router.back() : router.replace('/login'));

  return (
    <View style={{ flex: 1 }}>
      <HeaderBar title={contact ? t('contact') : t('forgotTitle')} onBack={back} />
      <ScrollView contentContainerStyle={{ gap: 20, paddingHorizontal: 20, paddingVertical: 24 }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }}>
          <Icon name={contact ? 'phone' : 'lock'} size={34} color={c.primary} />
        </View>
        <Text variant="bodyLg" weight="500" style={{ fontSize: 18, lineHeight: 28, textAlign: 'center' }}>{contact ? t('contactText') : t('forgotText')}</Text>
        <View style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: c.divider, borderRadius: 16, padding: 16, gap: 4, alignItems: 'center' }}>
          <Text variant="meta" color={c.muted}>{t('adminNumber')}</Text>
          <Text mono weight="700" style={{ fontSize: 22 }}>{number}</Text>
        </View>
        <Button label={t('call')} icon="phone" onPress={() => { toast(t('calling')); Linking.openURL(`tel:+${digits}`).catch(() => {}); }} />
        <Button label={t('whatsapp')} icon="chat" variant="secondary" onPress={() => { toast(t('openingWa')); Linking.openURL(`https://wa.me/${digits}`).catch(() => {}); }} />
      </ScrollView>
    </View>
  );
}
