import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { Modal, ModalActions, PageTitle, Table, type Col } from '../../../components/admin/parts';
import { RequireStaff, useAdmin } from '../../../components/admin/Shell';
import { Icon } from '../../../components/Icon';
import { Button, Field, Input, Text } from '../../../components/ui';
import { useStaff } from '../../../hooks/useCustomer';
import { useAdminT, useLang } from '../../../i18n';
import { ApiError, addCustomer } from '../../../mock/api';
import { useDb } from '../../../mock/store';
import type { Customer } from '../../../mock/types';
import { c } from '../../../theme';

export default function Customers() {
  const t = useAdminT();
  const { lang } = useLang();
  const router = useRouter();
  const db = useDb();
  const [q, setQ] = useState('');
  const [adding, setAdding] = useState(false);
  const query = q.trim().toLowerCase();
  const rows = db.customers.filter((x) => !query || x.name.en.toLowerCase().includes(query) || x.name.ar.includes(query) || x.mobile.includes(query));

  const cols: Col<Customer>[] = [
    { key: 'n', header: t('colName'), flex: 1.6, render: (x) => (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center' }}><Text weight="700" color={c.primary}>{x.name[lang].charAt(0)}</Text></View>
        <Text variant="bodyLg" weight="500" style={{ fontSize: 15 }}>{x.name[lang]}</Text>
      </View>) },
    { key: 'm', header: t('colMobile'), flex: 1, render: (x) => <Text mono style={{ fontSize: 15 }}>{x.mobile}</Text> },
    { key: 's', header: t('colShipments'), flex: 0.6, render: (x) => <Text weight="600">{db.shipments.filter((s) => s.customerId === x.id).length}</Text> },
  ];

  return (
    <RequireStaff>
      <PageTitle title={t('navCustomers')} actions={<Button icon="plus" label={t('addCustomer')} height={44} fontSize={15} onPress={() => setAdding(true)} />} />
      <View style={{ maxWidth: 440 }}>
        <Input height={48} fontSize={16} value={q} onChangeText={setQ} placeholder={t('custSearch')} endAction={<View style={{ paddingHorizontal: 8 }}><Icon name="search" size={18} color={c.muted} /></View>} />
      </View>
      <Table cols={cols} rows={rows} rowKey={(x) => x.id} empty={t('noResults')} onRowPress={(x) => router.push(`/admin/customers/${x.id}`)} />
      {adding ? <AddCustomer onClose={() => setAdding(false)} /> : null}
    </RequireStaff>
  );
}

function AddCustomer({ onClose }: { onClose: () => void }) {
  const t = useAdminT();
  const { toast } = useAdmin();
  const staff = useStaff()!;
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [err, setErr] = useState('');
  const save = async () => {
    try { await addCustomer(name, mobile, staff.id); toast(t('custAdded')); onClose(); }
    catch (e) { setErr(e instanceof ApiError && e.code === 'mobile_exists' ? t('mobileExists') : t('addErr')); }
  };
  return (
    <Modal title={t('addCustomer')} onClose={onClose}>
      <Field label={t('newCustName')}><Input height={48} fontSize={16} value={name} onChangeText={(v) => { setName(v); setErr(''); }} /></Field>
      <Field label={t('custMobile')} error={err || undefined}><Input ltr height={48} fontSize={16} keyboardType="phone-pad" value={mobile} placeholder="05XXXXXXXX" error={!!err} onChangeText={(v) => { setMobile(v.replace(/[^\d]/g, '').slice(0, 10)); setErr(''); }} /></Field>
      <Text variant="meta" color={c.muted}>{t('ncHint')}</Text>
      <ModalActions>
        <Button variant="secondary" height={44} fontSize={15} label={t('cancel')} onPress={onClose} />
        <Button height={44} fontSize={15} label={t('save')} disabled={!name.trim() || mobile.length !== 10} onPress={save} />
      </ModalActions>
    </Modal>
  );
}
