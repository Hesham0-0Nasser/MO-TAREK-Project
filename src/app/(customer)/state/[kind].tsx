import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StateView } from '../../../components/chrome';
import { useCustomer } from '../../../hooks/useCustomer';
import { useT } from '../../../i18n';
import { logout } from '../../../mock/api';

// System states from the design (M10): no internet, session expired, generic error.
export default function SystemState() {
  const { kind } = useLocalSearchParams<{ kind: string }>();
  const t = useT();
  const router = useRouter();
  const customer = useCustomer();
  const home = () => router.replace(customer ? '/shipments' : '/');

  if (kind === 'session') {
    return <StateView icon="clock" title={t('sessionTitle')} text={t('sessionText')} button={t('login')} onPress={() => { logout(); router.replace('/login'); }} />;
  }
  if (kind === 'offline') {
    return <StateView icon="wifiOff" title={t('noInternetTitle')} text={t('noInternetText')} button={t('tryAgain')} onPress={home} />;
  }
  return <StateView icon="alert" title={t('errorTitle')} text={t('errorText')} button={t('tryAgain')} onPress={home} />;
}
