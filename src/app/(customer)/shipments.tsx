import { Redirect, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { TabBar } from '../../components/chrome';
import { Skeleton } from '../../components/customerParts';
import { Icon } from '../../components/Icon';
import { ShipmentCard } from '../../components/shipment';
import { Button, FilterChip, Input, Text } from '../../components/ui';
import { useAsync } from '../../hooks/useAsync';
import { useCustomer } from '../../hooks/useCustomer';
import { useLang, useT } from '../../i18n';
import { currentStatus, lastUpdate, listMyShipments } from '../../mock/api';
import { useDb } from '../../mock/store';
import { theme, c } from '../../theme';

type Filter = 'all' | 'active' | 'delivered';

export default function MyShipments() {
  const t = useT();
  const { lang } = useLang();
  const router = useRouter();
  const customer = useCustomer();
  const db = useDb();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  // The async call only drives the skeleton; the list itself is read live so admin changes show instantly.
  const load = useAsync(() => (customer ? listMyShipments(customer.id) : Promise.resolve([])), [customer?.id]);

  const items = useMemo(() => {
    if (!customer) return [];
    return db.shipments
      .filter((s) => s.customerId === customer.id)
      .sort((a, b) => lastUpdate(b).localeCompare(lastUpdate(a)))
      .filter((s) => {
        const st = currentStatus(db, s);
        if (filter === 'active') return !st.isFinal;
        if (filter === 'delivered') return st.id === 'delivered';
        return true;
      });
  }, [db, customer, filter]);

  if (!customer) return <Redirect href="/login" />;
  if (customer.mustChange) return <Redirect href="/change-password?temp=1" />;

  const q = query.trim().toUpperCase();
  const go = () => q && router.push(`/shipment/${q}`);
  const owned = db.shipments.filter((s) => s.customerId === customer.id).length;
  const shown = q ? items.filter((s) => s.code.includes(q)) : items;

  return (
    <View style={{ flex: 1 }}>
      {load.loading ? <Skeleton rows={3} /> : (
        <ScrollView contentContainerStyle={{ gap: 16, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
          <View style={{ gap: 2, paddingHorizontal: 4, paddingTop: 8, alignItems: 'flex-start' }}>
            <Text color={c.text3}>{t('hello', { name: customer.name[lang].split(' ')[0] })}</Text>
            <Text variant="display" style={{ fontSize: 26, lineHeight: 34 }}>{t('myShipments')}</Text>
          </View>
          <Input
            height={56} fontSize={17} value={query} placeholder={t('searchPh')} onSubmit={go}
            onChangeText={(v) => setQuery(v.toUpperCase().replace(/\s/g, '').slice(0, 12))}
            endAction={q ? <Button label={t('track')} height={44} fontSize={15} onPress={go} /> : <View style={{ paddingHorizontal: 8 }}><Icon name="search" size={20} color={c.muted} /></View>}
          />
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {(['all', 'active', 'delivered'] as const).map((k) => <FilterChip key={k} label={t(k)} selected={filter === k} onPress={() => setFilter(k)} />)}
          </View>
          {shown.map((s) => (
            <ShipmentCard key={s.id} code={s.code} description={s.description[lang]} status={currentStatus(db, s)} lastAt={lastUpdate(s)} onPress={() => router.push(`/shipment/${s.code}`)} />
          ))}
          {owned === 0 ? (
            <View style={{ alignItems: 'center', gap: 12, paddingVertical: 48, paddingHorizontal: 16 }}>
              <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', borderWidth: 1, borderColor: c.divider, alignItems: 'center', justifyContent: 'center' }}><Icon name="package" size={36} color={c.placeholder} /></View>
              <Text variant="heading" style={{ fontSize: 19, textAlign: 'center' }}>{t('emptyTitle')}</Text>
              <Text color={c.text3} style={{ textAlign: 'center', lineHeight: 24 }}>{t('emptyText')}</Text>
            </View>
          ) : shown.length === 0 ? (
            <Text color={c.muted} style={{ textAlign: 'center', paddingVertical: 24 }}>{t('noResults')}</Text>
          ) : null}
        </ScrollView>
      )}
      <TabBar active="shipments" />
    </View>
  );
}
