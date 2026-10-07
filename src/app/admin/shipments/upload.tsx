import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';
import { PageTitle, Table, type Col } from '../../../components/admin/parts';
import { RequireStaff, useAdmin } from '../../../components/admin/Shell';
import { Icon } from '../../../components/Icon';
import { Button, Card, Text } from '../../../components/ui';
import { useStaff } from '../../../hooks/useCustomer';
import { useAdminT } from '../../../i18n';
import { buildPreview, downloadNumbers, downloadTemplate, importExcel, parseFile, sampleRows, type ImportedRow, type Preview, type RawRow, type RowError } from '../../../mock/excel';
import { c } from '../../../theme';

// Three steps: upload -> preview (valid rows and error rows) -> confirm and download generated numbers (PRD 5.5).
export default function Upload() {
  const t = useAdminT();
  const router = useRouter();
  const { toast } = useAdmin();
  const staff = useStaff();
  const input = useRef<HTMLInputElement | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [rows, setRows] = useState<RawRow[] | null>(null);
  const [fileName, setFileName] = useState('');
  const [preview, setPreview] = useState<Preview | null>(null);
  const [imported, setImported] = useState<ImportedRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [readErr, setReadErr] = useState(false);

  const load = (r: RawRow[], name: string) => { setRows(r); setFileName(name); setReadErr(false); };
  const onFile = async (file?: File) => {
    if (!file) return;
    try { load(await parseFile(file), file.name); } catch { setRows(null); setReadErr(true); }
  };
  const toPreview = () => { if (rows) { setPreview(buildPreview(rows)); setStep(2); } };
  const confirm = async () => {
    if (!preview || !staff) return;
    setBusy(true);
    setImported(await importExcel(preview.valid, staff.id));
    setBusy(false);
    setStep(3);
  };

  const errCols: Col<RowError>[] = [
    { key: 'r', header: t('colRow'), width: 90, render: (e) => <Text mono weight="600">{e.row}</Text> },
    { key: 'why', header: t('colReason'), flex: 1, render: (e) => <Text color={c.danger} style={{ fontSize: 15 }}>{t(`err_${e.reason}` as 'err_mobile_missing')}</Text> },
  ];

  const stepper = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      {[t('step1'), t('step2'), t('step3')].map((name, i) => {
        const n = i + 1, done = n < step, on = n === step;
        return (
          <React.Fragment key={n}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: done ? '#16A34A' : on ? c.primary : '#E4E7EC', alignItems: 'center', justifyContent: 'center' }}>
                {done ? <Icon name="check" size={16} color="#fff" stroke={3} /> : <Text variant="meta" weight="700" color={on ? '#fff' : c.text3}>{n}</Text>}
              </View>
              <Text variant="bodyLg" weight="600" color={on || done ? c.ink : c.muted} style={{ fontSize: 15 }}>{name}</Text>
            </View>
            {i < 2 ? <View style={{ width: 40, height: 2, backgroundColor: '#E4E7EC' }} /> : null}
          </React.Fragment>
        );
      })}
    </View>
  );

  return (
    <RequireStaff>
      <PageTitle title={t('upTitle')} />
      {stepper}

      {step === 1 ? (
        <Card style={{ gap: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <Text color={c.text3} style={{ flex: 1, minWidth: 240, lineHeight: 24 }}>{t('templateHint')}</Text>
            <Button variant="secondary" icon="download" label={t('downloadTemplate')} height={44} fontSize={15} onPress={() => { downloadTemplate(); toast(t('downloading')); }} />
          </View>
          {/* hidden native file input (web) */}
          {React.createElement('input', { ref: input, type: 'file', accept: '.xlsx,.xls', style: { display: 'none' }, onChange: (e: { target: { files: FileList | null } }) => onFile(e.target.files?.[0]) })}
          {!rows ? (
            <Pressable accessibilityRole="button" onPress={() => input.current?.click()} style={{ alignItems: 'center', gap: 8, padding: 40, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', borderColor: c.border, cursor: 'pointer' } as ViewStyle}>
              <Icon name="file" size={40} color={c.placeholder} stroke={1.6} />
              <Text variant="bodyLg">{t('chooseFile')}</Text>
              <Text variant="meta" color={c.muted}>{t('dropHint')}</Text>
            </Pressable>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 14, backgroundColor: '#E7F6EC' }}>
              <Icon name="file" size={32} color="#067647" />
              <View style={{ flex: 1 }}>
                <Text variant="bodyLg" weight="600" selectable>{fileName}</Text>
                <Text variant="meta" color={c.text2}>{t('fileReady')} · {rows.length} {t('rowsWord')}</Text>
              </View>
              <Button variant="text" label={t('removeFile')} height={40} fontSize={14} onPress={() => { setRows(null); if (input.current) input.current.value = ''; }} />
            </View>
          )}
          {readErr ? <Text color={c.danger}>{t('fileUnreadable')}</Text> : null}
          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {!rows ? <Button variant="secondary" label={t('useSample')} height={48} fontSize={15} onPress={() => load(sampleRows(), 'sample-shipments.xlsx')} /> : null}
            <Button label={t('continue')} height={48} fontSize={16} disabled={!rows} onPress={toPreview} />
          </View>
        </Card>
      ) : null}

      {step === 2 && preview ? (
        <View style={{ gap: 16 }}>
          <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
            <Card style={{ flex: 1, minWidth: 200, gap: 4, backgroundColor: '#E7F6EC', borderColor: '#E7F6EC' }}>
              <Text variant="meta" color="#067647" weight="600">{t('validRows')}</Text>
              <Text style={{ fontSize: 36, lineHeight: 44 }} weight="700" color="#067647">{preview.valid.length}</Text>
            </Card>
            <Card style={{ flex: 1, minWidth: 200, gap: 4, backgroundColor: preview.errors.length ? c.dangerBg : c.chipBg, borderColor: 'transparent' }}>
              <Text variant="meta" color={preview.errors.length ? c.danger : c.text3} weight="600">{t('errorRows')}</Text>
              <Text style={{ fontSize: 36, lineHeight: 44 }} weight="700" color={preview.errors.length ? c.danger : c.text3}>{preview.errors.length}</Text>
            </Card>
          </View>
          {preview.tooMany ? <Text color={c.warnFg}>{t('fileTooBig')}</Text> : null}
          {preview.errors.length ? (
            <>
              <Text color={c.text3}>{t('errorsSkipped')}</Text>
              <Table cols={errCols} rows={preview.errors} rowKey={(e) => String(e.row)} />
            </>
          ) : null}
          <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Button variant="secondary" label={t('back')} height={48} fontSize={15} onPress={() => setStep(1)} />
            <Button label={t('confirmImport', { n: preview.valid.length })} height={48} fontSize={16} disabled={!preview.valid.length} loading={busy} onPress={confirm} />
          </View>
        </View>
      ) : null}

      {step === 3 ? (
        <Card style={{ alignItems: 'center', gap: 16, padding: 40 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#E7F6EC', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={32} color="#067647" stroke={2.5} /></View>
          <Text variant="title">{t('importDone', { n: imported.length })}</Text>
          <Text color={c.text3} style={{ textAlign: 'center' }}>{t('importDoneSub')}</Text>
          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button icon="download" label={t('downloadNumbers')} onPress={() => { downloadNumbers(imported); toast(t('downloading')); }} />
            <Button variant="secondary" label={t('backToList')} onPress={() => router.push('/admin/shipments')} />
          </View>
        </Card>
      ) : null}
    </RequireStaff>
  );
}
