import type { Lang } from '../i18n/strings';

const MONTHS = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
};
const WORDS = {
  en: { today: 'Today', yesterday: 'Yesterday', twoDays: '2 days ago', nDays: (n: number) => `${n} days ago`, now: 'Just now' },
  ar: { today: 'اليوم', yesterday: 'أمس', twoDays: 'قبل يومين', nDays: (n: number) => `قبل ${n} أيام`, now: 'الآن' },
};

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
export const daysBetween = (iso: string) => Math.round((startOfDay(new Date()) - startOfDay(new Date(iso))) / 86400000);
const hm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

/** "Today 10:30", "Yesterday 16:05", "5 Oct 09:15". Western digits in both languages. */
export function formatWhen(iso: string, lang: Lang, sep = ' '): string {
  const d = new Date(iso), n = daysBetween(iso), w = WORDS[lang];
  const age = Date.now() - d.getTime();
  if (age >= 0 && age < 60000) return w.now;
  const day = n <= 0 ? w.today : n === 1 ? w.yesterday : `${d.getDate()} ${MONTHS[lang][d.getMonth()]}`;
  return `${day}${sep}${hm(d)}`;
}

/** Shipment-card "last update": relative for recent, a plain date for older ones. */
export function formatLast(iso: string, lang: Lang): string {
  const n = daysBetween(iso), w = WORDS[lang];
  if (n <= 0) return formatWhen(iso, lang);
  if (n === 1) return w.yesterday;
  if (n === 2) return w.twoDays;
  if (n <= 6) return w.nDays(n);
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[lang][d.getMonth()]}`;
}
