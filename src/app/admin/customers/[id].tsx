import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';
import { Modal, ModalActions, Table, type Col } from '../../../components/admin/parts';
import { RequireStaff, useAdmin } from '../../../components/admin/Shell';
import { Icon } from '../../../components/Icon';
import { StatusBadge } from '../../../components/shipment';
import { Button, Card, Text } from '../../../components/ui';
import { useStaff } from '../../../hooks/useCustomer';
import { useAdminT, useLang } from '../../../i18n';
import { currentStatus, lastUpdate, resetPassword } from '../../../mock/api';
import { formatLast } from '../../../mock/format';
import { useDb } from '../../../mock/store';
import type { Shipment } from '../../../mock/types';
import { c } from '../../../theme';

export default function CustomerDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useAdminT();
  const { lang, rtl } = useLang();
  const router = useRouter();
  const { copy } = useAdmin();
  const staff = useStaff();
  const db = useDb();
  const [modal, setModal] = useState<'confirm' | 'temp' | null>(null);
  const [temp, setTemp] = useState('');
  const [busy, setBusy] = useState(false);
  const customer = db.customers.find((x) => x.id === id);
  if (!customer) return <RequireStaff><Text color={c.muted}>{t('noResults')}</Text></RequireStaff>;
  const ships = db.shipments.filter((s) => s.customerId === customer.id);

  const reset = async () => {
    setBusy(true);
    setTemp(await resetPassword(customer.id, staff!.id));
    setBusy(false);
    setModal('temp');
  };
  const cols: Col<Shipment>[] = [
    { key: 'c', header: t('colNumber'), flex: 1.2, render: (s) => <Text mono weight="600" style={{ fontSize: 15 }}>{s.code}</Text> },
    { key: 'd', header: t('colDesc'), flex: 1.2, render: (s) => <Text color={c.text2} style={{ fontSize: 15 }}>{s.description[lang]}</Text> },
    { key: 's', header: t('colStatus'), flex: 1.4, render: (s) => <StatusBadge size="xs" status={currentStatus(db, s)} /> },
    { key: 'u', header: t('colUpdated'), flex: 0.8, render: (s) => <Text variant="meta" color={c.muted}>{formatLast(lastUpdate(s), lang)}</Text> },
  ];

  return (
    <RequireStaff>
      <Pressable accessibilityRole="link" onPress={() => router.push('/admin/customers')} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingVertical: 4, cursor: 'pointer' } as ViewStyle}>
        <Icon name={rtl ? 'arrowR' : 'arrowL'} size={18} color={c.text3} />
        <Text variant="bodyLg" weight="600" color={c.text3} style={{ fontSize: 15 }}>{t('backToCustomers')}</Text>
      </Pressable>
      <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 22 }} weight="700" color={c.primary}>{customer.name[lang].charAt(0)}</Text></View>
          <View style={{ gap: 4, alignItems: 'flex-start' }}>
            <Text variant="heading" style={{ fontSize: 20 }}>{customer.name[lang]}</Text>
            <Text mono color={c.text3} style={{ fontSize: 15 }}>{customer.mobile}</Text>
            {customer.mustChange ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, height: 26, borderRadius: 13, backgroundColor: c.warnBg }}>
                <Icon name="lock" size={14} color="#B54708" /><Text variant="meta" weight="600" color="#B54708" style={{ fontSize: 13 }}>{t('mustChange')}</Text>
              </View>
            ) : null}
          </View>
        </View>
        <Button variant="secondary" icon="lock" label={t('resetPw')} height={44} fontSize={15} onPress={() => setModal('confirm')} />
      </Card>
      <View style={{ gap: 12 }}>
        <Text variant="heading">{t('customerShipments')}</Text>
        <Table cols={cols} rows={ships} rowKey={(s) => s.id} empty={t('noShipments')} onRowPress={(s) => router.push(`/admin/shipments/${s.code}`)} />
      </View>

      {modal === 'confirm' ? (
        <Modal title={t('resetConfirmTitle')} onClose={() => setModal(null)} width={460}>
          <Text color={c.text3} style={{ lineHeight: 24 }}>{t('resetConfirmText')}</Text>
          <ModalActions>
            <Button variant="secondary" height={44} fontSize={15} label={t('cancel')} onPress={() => setModal(null)} />
            <Button variant="danger" height={44} fontSize={15} label={t('resetYes')} loading={busy} onPress={reset} />
          </ModalActions>
        </Modal>
      ) : null}
      {modal === 'temp' ? (
        <Modal title={t('tempTitle')} onClose={() => { setModal(null); setTemp(''); }} width={460}>
          <View style={{ alignItems: 'center', gap: 12, padding: 18, borderRadius: 14, backgroundColor: c.canvas }}>
            <Text mono weight="700" style={{ fontSize: 30, letterSpacing: 2 }} selectable>{temp}</Text>
            <Button icon="copy" label={t('copy')} height={44} fontSize={15} onPress={() => copy(temp)} />
          </View>
          <View style={{ flexDirection: 'row', gap: 10, padding: 12, borderRadius: 12, backgroundColor: c.warnBg }}>
            <Icon name="alert" size={18} color="#B54708" />
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="meta" weight="700" color={c.warnFg}>{t('tempOnce')}</Text>
              <Text variant="meta" color={c.warnFg}>{t('tempNote')}</Text>
            </View>
          </View>
          <ModalActions><Button height={44} fontSize={15} label={t('done')} onPress={() => { setModal(null); setTemp(''); }} /></ModalActions>
        </Modal>
      ) : null}
    </RequireStaff>
  );
}
