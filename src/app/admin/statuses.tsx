import React, { useState } from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';
import { Modal, ModalActions, PageTitle } from '../../components/admin/parts';
import { RequireStaff, useAdmin } from '../../components/admin/Shell';
import { Icon } from '../../components/Icon';
import { StatusBadge } from '../../components/shipment';
import { Button, Card, Field, Input, Switch, Text } from '../../components/ui';
import { useAdminT, useLang } from '../../i18n';
import { deleteStatus, reorderStatuses, saveStatus, setStatusActive, sortedStatuses, statusUsage } from '../../mock/api';
import { useDb } from '../../mock/store';
import type { Status } from '../../mock/types';
import { STATUS_ICONS, TONE_KEYS, c, theme, type ToneKey } from '../../theme';

type Draft = { id?: string; nameAr: string; nameEn: string; tone: ToneKey; icon: string; isFinal: boolean; sendPush: boolean };

export default function Statuses() {
  const t = useAdminT();
  const { lang } = useLang();
  const { toast } = useAdmin();
  const db = useDb();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [drag, setDrag] = useState<string | null>(null);
  const list = sortedStatuses(db);

  const move = (from: string, to: string) => {
    if (from === to) return;
    const ids = list.map((s) => s.id);
    ids.splice(ids.indexOf(from), 1);
    ids.splice(ids.indexOf(to), 0, from);
    reorderStatuses(ids);
    toast(t('orderSaved'));
  };
  const nudge = (id: string, dir: -1 | 1) => {
    const i = list.findIndex((s) => s.id === id), j = i + dir;
    if (j < 0 || j >= list.length) return;
    move(id, list[j].id);
  };

  return (
    <RequireStaff manager>
      <PageTitle title={t('navStatuses')} sub={t('statusesSub')} actions={<Button icon="plus" label={t('addStatus')} height={44} fontSize={15} onPress={() => setDraft({ nameAr: '', nameEn: '', tone: 'blue', icon: 'package', isFinal: false, sendPush: true })} />} />
      <View style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: c.divider, borderRadius: 16, overflow: 'hidden' }}>
        {list.map((s, i) => {
          const used = statusUsage(db, s.id);
          // Web drag-and-drop on a plain div; the arrows below do the same job for touch and keyboard.
          return React.createElement(
            'div',
            {
              key: s.id, draggable: true,
              onDragStart: (e: { dataTransfer: DataTransfer }) => { e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', s.id); } catch { /* ignore */ } setDrag(s.id); },
              onDragOver: (e: { preventDefault: () => void }) => e.preventDefault(),
              onDrop: (e: { preventDefault: () => void }) => { e.preventDefault(); if (drag) move(drag, s.id); setDrag(null); },
              onDragEnd: () => setDrag(null),
              style: { borderTop: i === 0 ? 'none' : `1px solid #F2F4F7`, background: drag === s.id ? '#F2F4F7' : '#fff', opacity: s.active ? 1 : 0.6 },
            },
            <Row s={s} used={used} lang={lang} first={i === 0} last={i === list.length - 1} onUp={() => nudge(s.id, -1)} onDown={() => nudge(s.id, 1)}
              onEdit={() => setDraft({ id: s.id, nameAr: s.nameAr, nameEn: s.nameEn, tone: s.tone, icon: s.icon, isFinal: s.isFinal, sendPush: s.sendPush })}
              onToggle={() => setStatusActive(s.id, !s.active)}
              onDelete={() => { deleteStatus(s.id); toast(t('statusDeleted')); }} />,
          );
        })}
      </View>
      {draft ? <StatusModal draft={draft} setDraft={setDraft} onClose={() => setDraft(null)} onSave={async () => { await saveStatus({ ...draft }); toast(t('statusSaved')); setDraft(null); }} /> : null}
    </RequireStaff>
  );
}

function Row({ s, used, lang, first, last, onUp, onDown, onEdit, onToggle, onDelete }: { s: Status; used: number; lang: 'ar' | 'en'; first: boolean; last: boolean; onUp: () => void; onDown: () => void; onEdit: () => void; onToggle: () => void; onDelete: () => void }) {
  const t = useAdminT();
  const small = (label: string, icon: string, onPress: () => void, disabled?: boolean, color: string = c.text2) => (
    <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled} onPress={onPress} style={{ width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.3 : 1, cursor: disabled ? 'default' : 'pointer' } as ViewStyle}>
      <Icon name={icon} size={16} color={color} />
    </Pressable>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 16, flexWrap: 'wrap' }}>
      <Icon name="grip" size={20} color={c.placeholder} stroke={3} />
      <View style={{ minWidth: 200, flex: 1.4, gap: 4 }}>
        <StatusBadge status={s} />
        <Text variant="meta" color={c.muted} style={{ fontSize: 13 }}>{lang === 'ar' ? s.nameEn : s.nameAr}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 150, gap: 4, alignItems: 'flex-start' }}>
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          {s.isFinal ? <Tag text={t('final')} /> : null}
          {s.sendPush ? <Tag text={t('push')} icon="bell" /> : null}
        </View>
        <Text variant="meta" color={used ? c.text3 : c.muted} style={{ fontSize: 13 }}>{used ? t('inUse', { n: used }) : t('notUsed')}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Switch on={s.active} onToggle={onToggle} />
        <Text variant="meta" color={c.text3} style={{ width: 52 }}>{s.active ? t('active') : t('inactive')}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
        {small(t('moveUp'), 'chevL', onUp, first)}
        {small(t('moveDown'), 'chevR', onDown, last)}
        {small(t('edit'), 'edit', onEdit)}
        {used === 0
          ? small(t('delete'), 'trash', onDelete, false, c.danger)
          : <View style={{ paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}><Icon name="lock" size={14} color={c.muted} /><Text variant="meta" color={c.muted} style={{ fontSize: 12 }}>{t('cannotDelete')}</Text></View>}
      </View>
    </View>
  );
}

const Tag = ({ text, icon }: { text: string; icon?: string }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, height: 24, paddingHorizontal: 8, borderRadius: 12, backgroundColor: c.chipBg }}>
    {icon ? <Icon name={icon} size={12} color={c.text2} /> : null}
    <Text variant="meta" weight="600" color={c.text2} style={{ fontSize: 12 }}>{text}</Text>
  </View>
);

function StatusModal({ draft, setDraft, onClose, onSave }: { draft: Draft; setDraft: (d: Draft) => void; onClose: () => void; onSave: () => void }) {
  const t = useAdminT();
  const tone = theme.tone[draft.tone];
  const ok = draft.nameAr.trim() && draft.nameEn.trim();
  const preview: Status = { id: 'p', order: 0, active: true, ...draft, nameAr: draft.nameAr || '—', nameEn: draft.nameEn || '—' };
  const set = (p: Partial<Draft>) => setDraft({ ...draft, ...p });
  const toggleRow = (label: string, hint: string, on: boolean, fn: () => void) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ flex: 1 }}><Text variant="bodyLg" weight="600" style={{ fontSize: 15 }}>{label}</Text><Text variant="meta" color={c.muted} style={{ fontSize: 13 }}>{hint}</Text></View>
      <Switch on={on} onToggle={fn} />
    </View>
  );
  return (
    <Modal title={draft.id ? t('editStatus') : t('addStatus')} onClose={onClose} width={560}>
      <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
        <View style={{ flex: 1, minWidth: 200 }}><Field label={t('nameAr')}><Input height={48} fontSize={16} value={draft.nameAr} onChangeText={(v) => set({ nameAr: v })} /></Field></View>
        <View style={{ flex: 1, minWidth: 200 }}><Field label={t('nameEn')}><Input height={48} fontSize={16} ltr value={draft.nameEn} onChangeText={(v) => set({ nameEn: v })} /></Field></View>
      </View>
      <Field label={t('color')}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {TONE_KEYS.map((k) => (
            <Pressable key={k} accessibilityRole="button" accessibilityLabel={k} onPress={() => set({ tone: k })} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.tone[k].solid, borderWidth: 3, borderColor: draft.tone === k ? c.ink : 'transparent', cursor: 'pointer' } as ViewStyle} />
          ))}
        </View>
      </Field>
      <Field label={t('icon')}>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {STATUS_ICONS.map((k) => (
            <Pressable key={k} accessibilityRole="button" accessibilityLabel={k} onPress={() => set({ icon: k })} style={{ width: 44, height: 44, borderRadius: 12, borderWidth: 1.5, borderColor: draft.icon === k ? tone.solid : c.divider, backgroundColor: draft.icon === k ? tone.bg : '#fff', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' } as ViewStyle}>
              <Icon name={k} size={22} color={draft.icon === k ? tone.fg : c.text3} />
            </Pressable>
          ))}
        </View>
      </Field>
      {toggleRow(t('finalStatus'), t('finalHint'), draft.isFinal, () => set({ isFinal: !draft.isFinal }))}
      {toggleRow(t('pushToggle'), t('pushHint'), draft.sendPush, () => set({ sendPush: !draft.sendPush }))}
      <View style={{ gap: 6, padding: 12, borderRadius: 12, backgroundColor: c.canvas }}>
        <Text variant="meta" color={c.muted}>{t('preview')}</Text>
        <StatusBadge status={preview} />
      </View>
      <ModalActions>
        <Button variant="secondary" height={44} fontSize={15} label={t('cancel')} onPress={onClose} />
        <Button height={44} fontSize={15} label={t('save')} disabled={!ok} onPress={onSave} />
      </ModalActions>
    </Modal>
  );
}
