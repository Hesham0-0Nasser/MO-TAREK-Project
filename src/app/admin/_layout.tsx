import { Slot } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { AdminShell } from '../../components/admin/Shell';
import { LangProvider, useLang } from '../../i18n';
import { c } from '../../theme';

function Inner() {
  const { dir } = useLang();
  return (
    <View {...({ dir } as object)} style={{ flex: 1, backgroundColor: c.canvas }}>
      <AdminShell><Slot /></AdminShell>
    </View>
  );
}

// "/admin" is the staff dashboard (desktop-first, mirrors in Arabic).
export default function AdminLayout() {
  return (
    <LangProvider area="admin">
      <Inner />
    </LangProvider>
  );
}
