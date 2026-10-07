import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { HeaderBar, StateView } from '../../../components/chrome';
import { ShipmentView, Skeleton } from '../../../components/customerParts';
import { useAsync } from '../../../hooks/useAsync';
import { useCustomer } from '../../../hooks/useCustomer';
import { useT } from '../../../i18n';
import { getMyShipment } from '../../../mock/api';
import { useDb } from '../../../mock/store';

// Shipment details for a logged-in customer. Shipments of other customers fall back to the public view (no description).
export default function ShipmentDetails() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const t = useT();
  const router = useRouter();
  const customer = useCustomer();
  const db = useDb(); // live: an admin status change updates this screen
  const res = useAsync(() => getMyShipment(String(code), customer?.id ?? ''), [code, customer?.id]);

  if (!customer) return <Redirect href={`/result/${code}`} />;
  const back = () => (router.canGoBack() ? router.back() : router.replace('/shipments'));

  const shipment = db.shipments.find((s) => s.code === String(code).toUpperCase());
  let body: React.ReactNode = null;
  if (res.loading) body = <Skeleton rows={2} />;
  else if (res.error || !shipment) body = <StateView icon="searchX" title={t('notFoundTitle')} text={t('notFoundText')} button={t('tryAgain')} onPress={back} />;
  else {
    const history = shipment.history.map((h) => ({ status: db.statuses.find((s) => s.id === h.statusId)!, note: h.note, at: h.at }));
    const last = history[history.length - 1];
    body = (
      <ShipmentView
        showLoginBanner={false}
        data={{ code: shipment.code, status: last.status, lastAt: last.at, history, description: shipment.customerId === customer.id ? shipment.description : undefined }}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <HeaderBar title={t('detailsTitle')} onBack={back} />
      {body}
    </View>
  );
}
