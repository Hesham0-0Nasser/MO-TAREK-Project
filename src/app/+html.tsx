import { ScrollViewStyleReset } from 'expo-router/html';
import React from 'react';

// Root HTML for the static web export: fonts, no-index, and full-height layout.
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="robots" content="noindex" />
        <meta name="description" content="Interactive demo of a shipment tracking app. Sample data only." />
        <title>Shipment Tracker · Demo</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap"
          rel="stylesheet"
        />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: 'body{background:#EEF0F3;margin:0}input::placeholder{color:#98A2B3}' }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
