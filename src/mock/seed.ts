import type { Db, HistoryEntry, Shipment } from './types';

export const DB_VERSION = 1;

// Timestamps are relative to "now" so the demo always reads "Today / Yesterday" correctly.
const ago = (days: number, h: number, m: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};
const H = (statusId: string, days: number, h: number, m: number, by: string, noteEn: string | null = null, noteAr = ''): HistoryEntry => ({
  statusId, note: noteEn ? { en: noteEn, ar: noteAr || noteEn } : null, byStaffId: by, at: ago(days, h, m),
});
const S = (code: string, customerId: string, ar: string, en: string, history: HistoryEntry[]): Shipment => ({
  id: 'sh_' + code, code, customerId, description: { ar, en }, history,
});

export function seedDb(): Db {
  return {
    version: DB_VERSION,
    settings: { contactNumber: '+966 11 456 7890' },
    statuses: [
      { id: 'received', nameEn: 'Received', nameAr: 'تم الاستلام', tone: 'blue', icon: 'package', isFinal: false, sendPush: true, order: 1, active: true },
      { id: 'transit', nameEn: 'In transit', nameAr: 'في الطريق', tone: 'amber', icon: 'truck', isFinal: false, sendPush: true, order: 2, active: true },
      { id: 'customs', nameEn: 'Waiting for customs clearance', nameAr: 'بانتظار التخليص الجمركي', tone: 'purple', icon: 'clock', isFinal: false, sendPush: true, order: 3, active: false },
      { id: 'delivered', nameEn: 'Delivered', nameAr: 'تم التسليم', tone: 'green', icon: 'check', isFinal: true, sendPush: true, order: 4, active: true },
      { id: 'returned', nameEn: 'Returned', nameAr: 'مرتجع', tone: 'red', icon: 'ret', isFinal: true, sendPush: true, order: 5, active: true },
      { id: 'cancelled', nameEn: 'Cancelled', nameAr: 'ملغي', tone: 'gray', icon: 'x', isFinal: true, sendPush: false, order: 6, active: true },
    ],
    customers: [
      { id: 'c1', name: { en: 'Ahmed Al-Otaibi', ar: 'أحمد العتيبي' }, mobile: '0551234567', password: 'demo1234', mustChange: false },
      { id: 'c2', name: { en: 'Mohammed Al-Ghamdi', ar: 'محمد الغامدي' }, mobile: '0509876543', password: 'demo1234', mustChange: false },
      { id: 'c3', name: { en: 'Noura Al-Harbi', ar: 'نورة الحربي' }, mobile: '0543217890', password: 'demo1234', mustChange: false },
      { id: 'c4', name: { en: 'Abdullah Al-Zahrani', ar: 'عبدالله الزهراني' }, mobile: '0567654321', password: 'demo1234', mustChange: false },
      { id: 'c5', name: { en: 'Reem Al-Qurashi', ar: 'ريم القرشي' }, mobile: '0532468135', password: 'demo1234', mustChange: false },
    ],
    staff: [
      { id: 's1', name: { en: 'Sara Al-Qahtani', ar: 'سارة القحطاني' }, email: 'admin@demo.com', password: 'demo1234', role: 'manager', active: true },
      { id: 's2', name: { en: 'Fahad Al-Shehri', ar: 'فهد الشهري' }, email: 'fahad@demo.com', password: 'demo1234', role: 'staff', active: true },
      { id: 's3', name: { en: 'Noura Al-Dosari', ar: 'نورة الدوسري' }, email: 'noura@demo.com', password: 'demo1234', role: 'staff', active: true },
      { id: 's4', name: { en: 'Khalid Al-Mutairi', ar: 'خالد المطيري' }, email: 'khalid@demo.com', password: 'demo1234', role: 'staff', active: false },
    ],
    shipments: [
      S('AB7K2M9XQ4', 'c1', 'قطع غيار سيارات', 'Car spare parts', [
        H('received', 3, 9, 15, 's3'),
        H('transit', 2, 14, 40, 's2', 'Left the warehouse', 'غادرت المستودع'),
        H('transit', 0, 10, 30, 's2', 'Reached the Jeddah sorting center', 'وصلت إلى مركز الفرز في جدة')]),
      S('TQ5W8E2RJ6', 'c2', 'أثاث مكتبي', 'Office furniture', [H('received', 0, 9, 5, 's1')]),
      S('ZL4H7P3NC8', 'c4', 'مواد غذائية', 'Food supplies', [H('received', 2, 10, 0, 's3'), H('transit', 0, 8, 12, 's2', 'Left Dammam', 'غادرت الدمام')]),
      S('KP3N8T5WZ2', 'c1', 'أجهزة إلكترونية', 'Electronics', [
        H('received', 5, 11, 0, 's3'),
        H('transit', 4, 8, 20, 's2', 'Left the Riyadh warehouse', 'غادرت مستودع الرياض'),
        H('delivered', 1, 16, 5, 's2', 'Delivered in Dammam', 'تم التسليم في الدمام')]),
      S('WE3G6N7FP5', 'c2', 'أدوات رياضية', 'Sports equipment', [H('received', 3, 15, 30, 's3'), H('transit', 1, 12, 40, 's2')]),
      S('BV6M2K9DX1', 'c3', 'مستحضرات تجميل', 'Cosmetics', [H('received', 4, 9, 0, 's3'), H('transit', 3, 13, 20, 's2'), H('delivered', 1, 11, 15, 's2', 'Delivered in Riyadh', 'تم التسليم في الرياض')]),
      S('HX9R4C6VB7', 'c1', 'ملابس', 'Clothing', [H('received', 2, 13, 45, 's3')]),
      S('RC8J5Q4TY9', 'c4', 'كتب', 'Books', [H('received', 4, 16, 0, 's3'), H('cancelled', 3, 10, 20, 's1', 'Cancelled at the customer’s request', 'أُلغيت بطلب من العميل')]),
      S('MD2F7Y8LQ3', 'c1', 'أدوات منزلية', 'Home tools', [
        H('received', 9, 10, 10, 's3'),
        H('transit', 8, 12, 30, 's2'),
        H('returned', 5, 15, 20, 's2', 'The recipient could not be reached', 'تعذّر الوصول إلى المستلم')]),
    ],
    pushEvents: [],
    audit: [],
  };
}
