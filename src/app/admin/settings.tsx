import React, { useState } from 'react';
import { View } from 'react-native';
import { Modal, ModalActions, PageTitle, Table, type Col } from '../../components/admin/parts';
import { RequireStaff, useAdmin } from '../../components/admin/Shell';
import { Button, Card, Field, Input, Segmented, Text } from '../../components/ui';
import { useStaff } from '../../hooks/useCustomer';
import { useAdminT, useLang } from '../../i18n';
import { addStaff, saveContactNumber, setStaffActive } from '../../mock/api';
import { useDb } from '../../mock/store';
import type { Staff } from '../../mock/types';
import { c } from '../../theme';

export default function Settings() {
  const t = useAdminT();
  const { lang } = useLang();
  const { toast } = useAdmin();
  const me = useStaff();
  const db = useDb();
  const [contact, setContact] = useState(db.settings.contactNumber);
  const [adding, setAdding] = useState(false);

  const pill = (text: string, bg: string, fg: string) => (
    <View style={{ height: 26, paddingHorizontal: 10, borderRadius: 13, backgroundColor: bg, justifyContent: 'center', alignSelf: 'flex-start' }}><Text variant="meta" weight="600" color={fg} style={{ fontSize: 13 }}>{text}</Text></View>
  );
  const cols: Col<Staff>[] = [
    { key: 'n', header: t('name'), flex: 1.2, render: (s) => <Text variant="bodyLg" weight="500" color={s.active ? c.ink : c.placeholder} style={{ fontSize: 15 }}>{s.name[lang]}</Text> },
    { key: 'e', header: t('colEmail'), flex: 1.3, render: (s) => <Text mono color={c.text2} style={{ fontSize: 14 }}>{s.email}</Text> },
    { key: 'r', header: t('colRole'), flex: 0.7, render: (s) => <Text style={{ fontSize: 15 }}>{s.role === 'manager' ? t('roleManager') : t('roleStaff')}</Text> },
    { key: 's', header: t('colState'), flex: 0.7, render: (s) => (s.active ? pill(t('enabled'), '#E7F6EC', '#067647') : pill(t('disabled'), c.chipBg, c.text3)) },
    { key: 'a', header: '', width: 110, render: (s) => (s.id === me?.id ? null : <Button variant="secondary" height={36} fontSize={13} label={s.active ? t('disable') : t('enable')} onPress={() => setStaffActive(s.id, !s.active)} />) },
  ];

  return (
    <RequireStaff manager>
      <PageTitle title={t('navSettings')} />
      <Card style={{ gap: 14 }}>
        <View style={{ gap: 4 }}>
          <Text variant="heading">{t('contactTitle')}</Text>
          <Text color={c.text3}>{t('contactHint')}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <View style={{ flex: 1, minWidth: 240, maxWidth: 360 }}><Input ltr height={48} fontSize={16} value={contact} onChangeText={setContact} /></View>
          <Button height={48} fontSize={15} label={t('save')} disabled={!contact.trim()} onPress={() => { saveContactNumber(contact, me!.id); toast(t('saved')); }} />
        </View>
      </Card>
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <Text variant="heading">{t('staffTitle')}</Text>
          <Button icon="plus" label={t('addStaff')} height={44} fontSize={15} onPress={() => setAdding(true)} />
        </View>
        <Table cols={cols} rows={db.staff} rowKey={(s) => s.id} />
      </View>
      {adding ? <AddStaff onClose={() => setAdding(false)} /> : null}
    </RequireStaff>
  );
}

function AddStaff({ onClose }: { onClose: () => void }) {
  const t = useAdminT();
  const { toast } = useAdmin();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'staff' | 'manager'>('staff');
  const ok = name.trim() && email.includes('@');
  return (
    <Modal title={t('addStaff')} onClose={onClose}>
      <Field label={t('name')}><Input height={48} fontSize={16} value={name} onChangeText={setName} /></Field>
      <Field label={t('colEmail')}><Input ltr height={48} fontSize={16} keyboardType="email-address" value={email} onChangeText={setEmail} /></Field>
      <Field label={t('colRole')}><Segmented height={40} value={role} onChange={setRole} options={[{ value: 'staff', label: t('roleStaff') }, { value: 'manager', label: t('roleManager') }]} /></Field>
      <ModalActions>
        <Button variant="secondary" height={44} fontSize={15} label={t('cancel')} onPress={onClose} />
        <Button height={44} fontSize={15} label={t('save')} disabled={!ok} onPress={() => { addStaff(name, email, role); toast(t('staffAdded')); onClose(); }} />
      </ModalActions>
    </Modal>
  );
}
