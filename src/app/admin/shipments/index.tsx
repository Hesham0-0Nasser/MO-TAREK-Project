import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { Modal, ModalActions, PageTitle, Pager, Select, Table, type Col } from '../../../components/admin/parts';
import { RequireStaff, useAdmin } from '../../../components/admin/Shell';
import { Icon } from '../../../components/Icon';
import { StatusBadge, statusName } from '../../../components/shipment';
import { Button, Field, Input, Text } from '../../../components/ui';
import { useStaff } from '../../../hooks/useCustomer';
import { useAdminT, useLang } from '../../../i18n';
import { addShipment, currentStatus, filterShipments, isValidMobile, lastUpdate, normalizeMobile, sortedStatuses } from '../../../mock/api';
import { formatLast } from '../../../mock/format';
import { useDb } from '../../../mock/store';
import type { Shipment } from '../../../mock/types';
import { c } from '../../../theme';

const PAGE = 6;

export default function Shipments() {
  const t = useAdminT();
  const { lang } = useLang();
  const router = useRouter();
  const db = useDb();
  const [query, setQuery] = useState('');
  const [statusId, setStatusId] = useState('all');
  const [date, setDate] = useState<'any' | 'today' | '7' | '30'>('any');
  const [page, setPage] = useState(1);
  const [adding, setAdding] = useState(false);

  const all = filterShipments(db, { query, statusId, date });
  const pages = Math.max(1, Math.ceil(all.length / PAGE));
  const cur = Math.min(page, pages);
  const rows = all.slice((cur - 1) * PAGE, cur * PAGE);
  const cust = (s: Shipment) => db.customers.find((x) => x.id === s.customerId)!;

  const cols: Col<Shipment>[] = [
    { key: 'code', header: t('colNumber'), flex: 1.3, render: (s) => <Text mono weight="600" style={{ fontSize: 15 }}>{s.code}</Text> },
    { key: 'cust', header: t('colCustomer'), flex: 1.4, render: (s) => <View style={{ gap: 2 }}><Text variant="bodyLg" weight="500" style={{ fontSize: 15 }}>{cust(s).name[lang]}</Text><Text mono color={c.muted} style={{ fontSize: 13 }}>{cust(s).mobile}</Text></View> },
    { key: 'desc', header: t('colDesc'), flex: 1.2, render: (s) => <Text color={c.text2} style={{ fontSize: 15 }}>{s.description[lang]}</Text> },
    { key: 'status', header: t('colStatus'), flex: 1.4, render: (s) => <StatusBadge status={currentStatus(db, s)} size="xs" /> },
    { key: 'upd', header: t('colUpdated'), flex: 0.9, render: (s) => <Text variant="meta" color={c.muted}>{formatLast(lastUpdate(s), lang)}</Text> },
  ];

  return (
    <RequireStaff>
      <PageTitle
        title={t('navShipments')}
        actions={<>
          <Button variant="secondary" icon="upload" label={t('uploadExcel')} height={44} fontSize={15} onPress={() => router.push('/admin/shipments/upload')} />
          <Button icon="plus" label={t('addShipment')} height={44} fontSize={15} onPress={() => setAdding(true)} />
        </>}
      />
      <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <View style={{ flex: 1, minWidth: 240 }}>
          <Input height={48} fontSize={16} value={query} placeholder={t('searchPh')} onChangeText={(v) => { setQuery(v); setPage(1); }}
            endAction={<View style={{ paddingHorizontal: 8 }}><Icon name="search" size={18} color={c.muted} /></View>} />
        </View>
        <Select value={statusId} onChange={(v) => { setStatusId(v); setPage(1); }} options={[{ value: 'all', label: t('allStatuses') }, ...sortedStatuses(db).map((s) => ({ value: s.id, label: statusName(s, lang) }))]} />
        <Select value={date} minWidth={150} onChange={(v) => { setDate(v as typeof date); setPage(1); }} options={[{ value: 'any', label: t('anyDate') }, { value: 'today', label: t('today') }, { value: '7', label: t('last7') }, { value: '30', label: t('last30') }]} />
      </View>
      <Table cols={cols} rows={rows} rowKey={(s) => s.id} empty={t('noResults')} onRowPress={(s) => router.push(`/admin/shipments/${s.code}`)} />
      <Pager page={cur} pages={pages} total={all.length} size={PAGE} onPage={setPage} />
      {adding ? <AddShipment onClose={() => setAdding(false)} /> : null}
    </RequireStaff>
  );
}

function AddShipment({ onClose }: { onClose: () => void }) {
  const t = useAdminT();
  const { lang } = useLang();
  const { copy } = useAdmin();
  const staff = useStaff()!;
  const db = useDb();
  const [mobile, setMobile] = useState('');
  const [custId, setCustId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [statusId, setStatusId] = useState(sortedStatuses(db).find((s) => s.active)!.id);
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);
  const [doneCode, setDoneCode] = useState<string | null>(null);

  const digits = mobile.replace(/\D/g, '');
  const picked = custId ? db.customers.find((x) => x.id === custId) : null;
  const matches = !picked && digits.length >= 3 ? db.customers.filter((x) => x.mobile.includes(digits)).slice(0, 4) : [];
  const isNew = !picked && digits.length >= 10 && matches.length === 0;

  const save = async () => {
    if (!picked && !(isValidMobile(normalizeMobile(mobile)) && name.trim())) return setErr(true);
    setBusy(true);
    const s = await addShipment({ customerId: picked?.id, newCustomer: { name, mobile }, description: desc, statusId }, staff.id);
    setDoneCode(s.code);
    setBusy(false);
  };

  if (doneCode) {
    return (
      <Modal title={t('created')} onClose={onClose} width={480}>
        <View style={{ alignItems: 'center', gap: 14 }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#E7F6EC', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={32} color="#067647" stroke={2.5} /></View>
          <Text color={c.text3} style={{ textAlign: 'center', lineHeight: 24 }}>{t('createdSub')}</Text>
          <View style={{ width: '100%', alignItems: 'center', gap: 8, padding: 16, borderRadius: 14, backgroundColor: c.canvas }}>
            <Text variant="meta" color={c.muted}>{t('codeLabel')}</Text>
            <Text mono weight="700" style={{ fontSize: 28, letterSpacing: 1.5 }} selectable>{doneCode}</Text>
            <Button icon="copy" label={t('copy')} height={44} fontSize={15} onPress={() => copy(doneCode)} />
          </View>
        </View>
        <ModalActions><Button variant="secondary" height={44} fontSize={15} label={t('done')} onPress={onClose} /></ModalActions>
      </Modal>
    );
  }

  return (
    <Modal title={t('addShipment')} onClose={onClose}>
      <Field label={t('custMobile')} error={err && !picked ? t('addErr') : undefined}>
        {picked ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: 12, borderRadius: 12, backgroundColor: c.primarySoft }}>
            <View><Text variant="bodyLg" weight="600">{picked.name[lang]}</Text><Text mono color={c.text3} style={{ fontSize: 14 }}>{picked.mobile}</Text></View>
            <Button variant="text" label={t('change')} height={40} fontSize={14} onPress={() => { setCustId(null); setMobile(''); }} />
          </View>
        ) : (
          <>
            <Input ltr keyboardType="phone-pad" value={mobile} placeholder="05XXXXXXXX" error={err} height={48} fontSize={16} onChangeText={(v) => { setMobile(v.replace(/[^\d ]/g, '').slice(0, 12)); setErr(false); }} />
            {!matches.length && !isNew ? <Text variant="meta" color={c.muted}>{t('custMobileHint')}</Text> : null}
            {matches.map((m) => (
              <View key={m.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: c.divider }}>
                <View><Text weight="600">{m.name[lang]}</Text><Text mono color={c.muted} style={{ fontSize: 13 }}>{m.mobile}</Text></View>
                <Button variant="secondary" label={lang === 'ar' ? 'اختيار' : 'Select'} height={36} fontSize={14} onPress={() => { setCustId(m.id); setMobile(m.mobile); }} />
              </View>
            ))}
            {isNew ? (
              <View style={{ gap: 8, padding: 12, borderRadius: 12, backgroundColor: c.warnBg }}>
                <Text variant="meta" weight="600" color={c.warnFg}>{t('newCustomer')}</Text>
                <Input height={44} fontSize={16} value={name} placeholder={t('newCustName')} onChangeText={(v) => { setName(v); setErr(false); }} />
              </View>
            ) : null}
          </>
        )}
      </Field>
      <Field label={t('descOptional')}><Input height={48} fontSize={16} value={desc} onChangeText={setDesc} /></Field>
      <Field label={t('initialStatus')}>
        <Select minWidth={240} value={statusId} onChange={setStatusId} options={sortedStatuses(db).filter((s) => s.active).map((s) => ({ value: s.id, label: statusName(s, lang) }))} />
      </Field>
      <ModalActions>
        <Button variant="secondary" height={44} fontSize={15} label={t('cancel')} onPress={onClose} />
        <Button height={44} fontSize={15} label={t('save')} loading={busy} onPress={save} />
      </ModalActions>
    </Modal>
  );
}
