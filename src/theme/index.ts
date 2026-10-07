// Design tokens from the Claude Design handoff ("Design System" page, section 3).
import { brand } from './brand';

export const theme = {
  brand,
  color: {
    primary: '#1D4F91', primarySoft: 'rgba(29,79,145,0.08)', onPrimary: '#FFFFFF', danger: '#B42318',
    ink: '#101828', text2: '#344054', text3: '#475467', muted: '#667085', placeholder: '#98A2B3',
    border: '#D0D5DD', divider: '#EAECF0', canvas: '#F6F7F9', surface: '#FFFFFF',
    dangerBg: '#FDECEA', warnBg: '#FEF3E2', warnFg: '#7A2E0E', chipBg: '#F2F4F7', stage: '#EEF0F3',
  },
  // Status tones: the admin picks one per status. Never map by status name.
  tone: {
    blue: { fg: '#175CD3', bg: '#EAF2FD', solid: '#2E6FD9' },
    amber: { fg: '#B54708', bg: '#FEF3E2', solid: '#E08A0B' },
    green: { fg: '#067647', bg: '#E7F6EC', solid: '#16A34A' },
    red: { fg: '#B42318', bg: '#FDECEA', solid: '#D92D20' },
    purple: { fg: '#6941C6', bg: '#F2EEFC', solid: '#7F56D9' },
    gray: { fg: '#475467', bg: '#F1F3F5', solid: '#98A2B3' },
  },
  font: { ar: "'IBM Plex Sans Arabic', sans-serif", en: "'IBM Plex Sans', sans-serif", mono: "'IBM Plex Mono', monospace" },
  type: {
    display: { fontSize: 28, lineHeight: 38, fontWeight: '700' },
    title: { fontSize: 24, lineHeight: 32, fontWeight: '700' },
    heading: { fontSize: 18, lineHeight: 26, fontWeight: '700' },
    bodyLg: { fontSize: 17, lineHeight: 24, fontWeight: '600' },
    body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
    meta: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
    code: { fontSize: 19, lineHeight: 24, fontWeight: '600' },
  },
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, '2xl': 32, '3xl': 48 },
  radius: { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 },
  size: { tapMin: 48, button: 56, input: 56, row: 64, tabBar: 64 },
  shadow: {
    card: { boxShadow: '0 1px 3px rgba(16,24,40,0.06)' },
    overlay: { boxShadow: '0 8px 24px rgba(16,24,40,0.16)' },
  },
} as const;

export type ToneKey = keyof typeof theme.tone;
export const TONE_KEYS = Object.keys(theme.tone) as ToneKey[];
export const STATUS_ICONS = ['package', 'truck', 'clock', 'check', 'ret', 'x', 'alert'] as const;
export const c = theme.color;
