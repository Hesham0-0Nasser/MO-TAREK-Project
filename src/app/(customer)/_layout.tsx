import { Stack } from 'expo-router';
import React from 'react';
import { PhoneFrame, ToastHost } from '../../components/chrome';
import { PushBanner } from '../../components/customerParts';
import { LangProvider } from '../../i18n';

// "/" is the customer mobile app. On wide screens it renders inside a phone frame.
export default function CustomerLayout() {
  return (
    <LangProvider area="customer">
      <PhoneFrame>
        <ToastHost>
          <Stack screenOptions={{ headerShown: false, animation: 'none', contentStyle: { backgroundColor: '#F6F7F9' } }} />
          <PushBanner />
        </ToastHost>
      </PhoneFrame>
    </LangProvider>
  );
}
