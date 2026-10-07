import React from 'react';
import Svg, { Path } from 'react-native-svg';

// Stroke icon paths taken from the design handoff.
const PATHS = {
  package: ['M21 8 12 3 3 8v8l9 5 9-5z', 'M3 8l9 5 9-5', 'M12 13v8', 'M7.5 5.5l9 5'],
  truck: ['M2 6h12v10H2z', 'M14 9h4l4 4v3h-8', 'M6 19.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z', 'M18 19.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'],
  check: ['M20 6 9 17l-5-5'],
  ret: ['M9 14 4 9l5-5', 'M4 9h11a5 5 0 0 1 0 10h-4'],
  x: ['M18 6 6 18', 'M6 6l12 12'],
  search: ['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z', 'M21 21l-4.3-4.3'],
  searchX: ['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z', 'M21 21l-4.3-4.3', 'M8.5 8.5l5 5', 'M13.5 8.5l-5 5'],
  chevL: ['M15 18l-6-6 6-6'],
  chevR: ['M9 18l6-6-6-6'],
  arrowL: ['M19 12H5', 'M11 18l-6-6 6-6'],
  arrowR: ['M5 12h14', 'M13 6l6 6-6 6'],
  copy: ['M9 9h11v11H9z', 'M5 15H4V4h11v1'],
  paste: ['M9 3h6v4H9z', 'M9 5H6v16h12V5h-3'],
  eye: ['M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'],
  eyeOff: ['M3 3l18 18', 'M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3 3.9', 'M6.6 6.6C3.9 8.4 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6', 'M9.9 9.9a3 3 0 0 0 4.2 4.2'],
  bell: ['M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.9 1.9 0 0 0 3.4 0'],
  globe: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M3 12h18', 'M12 3a14 14 0 0 1 0 18', 'M12 3a14 14 0 0 0 0 18'],
  sliders: ['M4 6h9', 'M17 6h3', 'M15 4v4', 'M4 12h3', 'M11 12h9', 'M9 10v4', 'M4 18h11', 'M19 18h1', 'M17 16v4'],
  phone: ['M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z'],
  chat: ['M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.6-5.2A8.5 8.5 0 1 1 21 11.5z'],
  lock: ['M5 11h14v10H5z', 'M8 11V7a4 4 0 1 1 8 0v4'],
  info: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'M12 16v-4', 'M12 8h.01'],
  alert: ['M12 3 2 20h20z', 'M12 10v4', 'M12 17h.01'],
  wifiOff: ['M2 2l20 20', 'M8.5 16.5a5 5 0 0 1 7 0', 'M5 13a10 10 0 0 1 5.2-2.8', 'M19 13a10 10 0 0 0-2.3-1.6', 'M2 8.8a15 15 0 0 1 4.2-2.7', 'M22 8.8A15 15 0 0 0 10.7 5', 'M12 20h.01'],
  wifi: ['M5 12.5a10 10 0 0 1 14 0', 'M8.5 16a5 5 0 0 1 7 0', 'M2 9a15 15 0 0 1 20 0', 'M12 19.5h.01'],
  clock: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'M12 6v6l4 2'],
  logout: ['M9 21H5V3h4', 'M16 17l5-5-5-5', 'M21 12H9'],
  refresh: ['M21 12a9 9 0 1 1-3-6.7L21 8', 'M21 3v5h-5'],
  plus: ['M12 5v14', 'M5 12h14'],
  upload: ['M12 15V3', 'M7 8l5-5 5 5', 'M4 15v5h16v-5'],
  download: ['M12 3v12', 'M7 10l5 5 5-5', 'M4 15v5h16v-5'],
  edit: ['M4 20h4L19 9l-4-4L4 16z'],
  grip: ['M9 6h.01', 'M15 6h.01', 'M9 12h.01', 'M15 12h.01', 'M9 18h.01', 'M15 18h.01'],
  users: ['M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M2 21a7 7 0 0 1 14 0', 'M16 3.5a4 4 0 0 1 0 7', 'M18 14a6 6 0 0 1 4 7'],
  tag: ['M3 3h8l10 10-8 8L3 11z', 'M7.5 7.5h.01'],
  file: ['M14 3H6v18h12V7z', 'M14 3v4h4', 'M9 12l6 6', 'M15 12l-6 6'],
  trash: ['M4 7h16', 'M10 11v6', 'M14 11v6', 'M6 7l1 13h10l1-13', 'M9 7V4h6v3'],
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 24, color = '#101828', stroke = 2 }: { name: string; size?: number; color?: string; stroke?: number }) {
  const paths = (PATHS as Record<string, readonly string[]>)[name] ?? PATHS.tag;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {paths.map((d, i) => <Path key={i} d={d} />)}
    </Svg>
  );
}
