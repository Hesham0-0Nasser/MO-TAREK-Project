import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { HeaderBar, StateView } from '../../../components/chrome';
import { ShipmentView, Skeleton } from '../../../components/customerParts';
import { useAsync } from '../../../hooks/useAsync';
import { useCustomer } from '../../../hooks/useCustomer';
import { useT } from '../../../i18n';
import { getShipmentByCode } from '../../../mock/api';

// Guest lookup: status and timeline only, no personal data (PRD 7).
export default function Result() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const t = useT();
  const router = useRouter();
  const customer = useCustomer();
  const res = useAsync(() => getShipmentByCode(String(code)), [code]);

  if (customer) return <Redirect href={`/shipment/${code}`} />;
  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const rate = res.error === 'rate_limited';

  return (
    <View style={{ flex: 1 }}>
      <HeaderBar title={t('resultTitle')} onBack={back} />
      {res.loading ? <Skeleton rows={2} /> : res.error ? (
        <StateView icon={rate ? 'clock' : 'searchX'} title={rate ? t('errorTitle') : t('notFoundTitle')} text={rate ? t('rateLimited') : t('notFoundText')} button={t('tryAgain')} onPress={back} />
      ) : res.data ? (
        <ShipmentView
          showLoginBanner
          data={{ code: res.data.code, status: res.data.status, lastAt: res.data.history[res.data.history.length - 1].at, history: res.data.history }}
        />
      ) : null}
    </View>
  );
}
