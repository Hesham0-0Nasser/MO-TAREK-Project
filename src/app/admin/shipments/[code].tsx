import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';
import { Table, Select, type Col } from '../../../components/admin/parts';
import { RequireStaff, useAdmin } from '../../../components/admin/Shell';
import { Icon } from '../../../components/Icon';
import { StatusBadge, statusName } from '../../../components/shipment';
import { Button, Card, Field, Input, Text } from '../../../components/ui';
import { useStaff } from '../../../hooks/useCustomer';
import { useAdminT, useLang } from '../../../i18n';
import { currentStatus, lastUpdate, sortedStatuses, updateShipmentStatus } from '../../../mock/api';
import { formatWhen } from '../../../mock/format';
import { useDb } from '../../../mock/store';
import type { HistoryEntry } from '../../../mock/types';
import { c, theme } from '../../../theme';

export default function ShipmentDetail() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const t = useAdminT();
  const { lang, rtl } = useLang();
  const router = useRouter();
  const { toast, copy } = useAdmin();
  const staff = useStaff();
  const db = useDb();
  const shipment = db.shipments.find((s) => s.code === code);
  const [statusId, setStatusId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  if (!shipment) return <RequireStaff><Text color={c.muted}>{t('noResults')}</Text></RequireStaff>;
  const cur = currentStatus(db, shipment);
  const selected = db.statuses.find((s) => s.id === (statusId ?? cur.id))!;
  const customer = db.customers.find((x) => x.id === shipment.customerId)!;
  const history = [...shipment.history].reverse();
  const tone = theme.tone[cur.tone];
  // Inactive statuses stay selectable only if they are the current one.
  const options = sortedStatuses(db).filter((s) => s.active || s.id === cur.id).map((s) => ({ value: s.id, label: statusName(s, lang) }));

  const save = async () => {
    setBusy(true);
    const r = await updateShipmentStatus(shipment.code, selected.id, note, staff!.id);
    setBusy(false);
    setNote('');
    toast(r.pushed ? t('statusUpdated') : t('statusUpdatedNoPush'));
  };

  const cols: Col<HistoryEntry>[] = [
    { key: 's', header: t('colStatus'), flex: 1.4, render: (h) => <StatusBadge size="xs" status={db.statuses.find((s) => s.id === h.statusId)!} /> },
    { key: 'n', header: t('colNote'), flex: 1.6, render: (h) => <Text color={h.note ? c.text2 : c.placeholder} style={{ fontSize: 15 }}>{h.note ? h.note[lang] : '—'}</Text> },
    { key: 'b', header: t('colBy'), flex: 1, render: (h) => <Text style={{ fontSize: 15 }}>{db.staff.find((s) => s.id === h.byStaffId)?.name[lang] ?? '—'}</Text> },
    { key: 'w', header: t('colWhen'), flex: 1, render: (h) => <Text variant="meta" color={c.muted}>{formatWhen(h.at, lang, ', ')}</Text> },
  ];

  return (
    <RequireStaff>
      <Pressable accessibilityRole="link" onPress={() => router.push('/admin/shipments')} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingVertical: 4, cursor: 'pointer' } as ViewStyle}>
        <Icon name={rtl ? 'arrowR' : 'arrowL'} size={18} color={c.text3} />
        <Text variant="bodyLg" weight="600" color={c.text3} style={{ fontSize: 15 }}>{t('backToList')}</Text>
      </Pressable>

      <Card style={{ gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text mono weight="700" style={{ fontSize: 24 }} selectable>{shipment.code}</Text>
              <Button variant="secondary" icon="copy" label={t('copy')} height={36} fontSize={13} onPress={() => copy(shipment.code)} />
            </View>
            <Text color={c.text3}>{customer.name[lang]} · <Text mono color={c.text3} style={{ fontSize: 15 }}>{customer.mobile}</Text></Text>
            <Text color={c.text2}>{shipment.description[lang]}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, backgroundColor: tone.bg }}>
            <Icon name={cur.icon} size={26} color={tone.fg} />
            <View>
              <Text variant="heading" color={tone.fg}>{statusName(cur, lang)}</Text>
              <Text variant="meta" color={c.text2}>{formatWhen(lastUpdate(shipment), lang)}</Text>
            </View>
          </View>
        </View>
      </Card>

      <Card style={{ gap: 16 }}>
        <Text variant="heading">{t('updateStatus')}</Text>
        <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <View style={{ minWidth: 240 }}><Field label={t('newStatus')}><Select minWidth={240} value={selected.id} onChange={setStatusId} options={options} /></Field></View>
          <View style={{ flex: 1, minWidth: 260 }}><Field label={t('noteOptional')}><Input height={48} fontSize={16} value={note} placeholder={t('notePh')} onChangeText={setNote} onSubmit={save} /></Field></View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, backgroundColor: selected.sendPush ? c.primarySoft : c.chipBg }}>
          <Icon name={selected.sendPush ? 'bell' : 'info'} size={18} color={selected.sendPush ? c.primary : c.muted} />
          <Text variant="meta" color={c.ink} style={{ flex: 1, fontSize: 15 }}>{selected.sendPush ? t('pushNote') : t('noPushNote')}</Text>
        </View>
        <View style={{ alignItems: 'flex-start' }}><Button label={t('saveStatus')} height={48} fontSize={16} loading={busy} onPress={save} /></View>
      </Card>

      <View style={{ gap: 12 }}>
        <Text variant="heading">{t('history')}</Text>
        <Table cols={cols} rows={history} rowKey={(h) => h.at + h.statusId + (h.note?.en ?? '')} />
      </View>
    </RequireStaff>
  );
}
