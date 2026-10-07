# Design Brief — Shipment Tracking App (Saudi Arabia)

Design a clickable prototype I can show to a client. The product is a simple shipment tracking system: a **mobile app for customers** (the main deliverable) and a **web admin dashboard** for staff. The app will be built in **React Native (Expo)**, so keep every design implementable with standard mobile components.

---

## 1. Product context

- The client ships goods in Saudi Arabia and has **no existing system**.
- Staff update shipment statuses **manually** from the dashboard. There are no drivers, no GPS, no maps, and no proof of delivery.
- Customers use the mobile app to check where their shipment is, and to see all their shipments if they log in.
- **The end users are non-technical.** The design must be extremely simple, obvious, and forgiving.

## 2. Design principles

1. **Simplicity above all.** One main action per screen. Fewest possible taps to see a shipment status.
2. **Large and readable.** Big text (body at least 16pt), big tap targets (at least 48px), high contrast.
3. **Arabic first.** The primary language is Arabic (RTL). English (LTR) is fully supported. Design Arabic screens first, then mirror to English.
4. **Calm and trustworthy.** Logistics should feel reliable and clear, not flashy. Generous spacing, clear hierarchy.
5. **Status is the hero.** The current shipment status should be the most visible element on every shipment screen.

## 3. Language and typography

- **Arabic (primary), RTL:** use a clean Arabic font such as IBM Plex Sans Arabic, Cairo, or Tajawal.
- **English (secondary), LTR:** use a matching sans-serif such as Inter or IBM Plex Sans.
- Show **both language versions** of the key screens (home, shipment details) in the prototype.
- Layout must **mirror correctly** in RTL: back arrows, progress direction, icon placement, list alignment.
- Numbers: use Western digits (0-9) by default.

## 4. Visual direction

- Branding is not defined yet. Use a **placeholder brand** (name: "Shipment Tracker" / "تتبع الشحنات", simple logo mark) that is easy to replace.
- Suggested palette: a trustworthy primary color (deep blue or green), a neutral gray scale, and **semantic status colors** (below). Support light mode; dark mode is optional.
- Rounded corners, soft shadows, plenty of white space.
- Use simple, familiar icons (package, truck, check, return arrow, X).

### Status colors (examples, statuses are dynamic)

| Status (EN / AR) | Meaning | Color suggestion |
|---|---|---|
| Received / تم الاستلام | Shipment registered | Blue |
| In transit / في الطريق | On its way | Orange / amber |
| Arrived / Delivered / وصلت / تم التسليم | Final, success | Green |
| Returned / مرتجع | Final, issue | Red or purple |
| Cancelled / ملغي | Final, inactive | Gray |

Statuses are **managed by the admin**, so the design must handle any number of statuses and any name length (do not hardcode only these five).

---

## 5. Customer mobile app (primary deliverable)

### Screens to design

**5.1 Home / Search (guest-friendly, the first screen)**
- App name/logo at top.
- A **large search box** for the shipment number with a big "Track" button. This is the main focus of the screen.
- Secondary actions: "Log in" and a language switch (AR / EN).
- Optional: paste-from-clipboard helper for the shipment number.

**5.2 Search result (guest view)**
- Shipment number, a **large status badge**, and the **timeline** of statuses with date and time.
- Shows only status + timeline. **No customer name, phone, or personal data.**
- A soft banner for unregistered users: "Log in to get notifications when your shipment status changes."
- Error state: "Shipment not found. Check the number and try again." (one uniform message).

**5.3 Login**
- Mobile number field + password field + "Log in" button.
- "Forgot password?" link that opens a simple info screen: "Please contact the administration to reset your password" with a **tap-to-call / tap-to-WhatsApp contact button** (number is editable from the dashboard).
- Show/hide password toggle. Clear, friendly error messages.

**5.4 Forced password change (first login after admin reset)**
- Explains "You are using a temporary password. Please choose a new one."
- New password + confirm password. Simple strength hint.

**5.5 My Shipments (logged-in home)**
- Header with a **search box** (so lookup is still one tap away).
- A list of the customer's shipments. Each card shows: shipment number, short description, **current status badge**, last update time.
- Filter chips: All / Active / Delivered (keep it minimal).
- Pull to refresh. Empty state: "You have no shipments yet."

**5.6 Shipment details**
- Large status badge at the top, shipment number (tap to copy), description.
- **Vertical timeline** of all statuses: icon, status name, date/time, optional note. Current status highlighted, earlier ones muted.
- Works the same in RTL and LTR (timeline mirrors).

**5.7 Settings / Profile**
- Language (AR / EN), notifications on/off, change password, contact the administration, log out.

**5.8 Push notification (design the visual)**
- Show a sample notification: "Shipment AB7K2M9XQ4: In transit" (in Arabic and English).
- Tapping it opens the shipment details screen.

### States to include
Loading (skeleton), empty list, search not found, no internet, session expired, error. Keep messages short and kind.

### Navigation
- Guest: Home (search) → Result. Login reachable from Home.
- Logged-in: bottom tab bar with **My Shipments** and **Settings**; search is always reachable from My Shipments.
- Keep navigation to a maximum of 2 tabs. Do not add extra sections.

---

## 6. Admin dashboard (web, secondary deliverable)

Desktop-first, clean, table-based, used by staff. Arabic + English with RTL/LTR.

**6.1 Login** (staff email/mobile + password)

**6.2 Shipments list (home)**
- Table: shipment number, customer (name + mobile), description, current status, last updated.
- Search by number or mobile; filters by status and date; pagination.
- Primary buttons: "Add shipment" and "Upload Excel".
- Row click opens shipment details.

**6.3 Add shipment (form / modal)**
- Customer mobile (with search/select existing customer or create new), description (optional), initial status (dropdown).
- On save: show the **generated shipment number** (random code like `AB7K2M9XQ4`) with a copy button.

**6.4 Shipment details + update status**
- Header with number, customer, current status.
- "Update status" control: pick a new status + optional note → Save.
- Full status history table (status, note, who changed it, when).
- Note that saving sends a push notification to the customer.

**6.5 Excel upload (3 steps)**
1. Download the template + upload the file.
2. **Preview:** counts of valid rows and rows with errors, with an error table (row number + reason).
3. Confirm → success screen with a "Download shipment numbers" button.

**6.6 Customers**
- Table: name, mobile, number of shipments. Add customer.
- Customer details: their shipments, and a **"Reset password"** action.
- Reset flow: confirm dialog → shows the **temporary password once** with a copy button and a note "Share it with the customer. They will be asked to change it at first login."

**6.7 Status management (manager)**
- List of statuses with drag-to-reorder.
- Add/edit status: Arabic name, English name, color/icon, "final status" toggle, "send push notification" toggle.
- Statuses used by shipments cannot be deleted, only deactivated (show this in the UI).

**6.8 Settings (manager)**
- Contact number shown to customers under "Forgot password?".
- Staff accounts list (add / disable).

---

## 7. Prototype requirements

Make it a **clickable prototype I can present to a non-technical client**.

- **Mobile app flows to make clickable:**
  1. Guest: Home → enter a number → result with timeline → "Log in" banner.
  2. Login → My Shipments → Shipment details.
  3. "Forgot password?" → contact administration screen.
  4. Language switch showing the full RTL ↔ LTR mirror.
  5. Sample push notification.
- **Dashboard flows to make clickable:**
  1. Shipments list → Add shipment → generated number.
  2. Open a shipment → update status.
  3. Excel upload (3 steps).
  4. Customers → Reset password → temporary password shown once.
  5. Status management.
- Use the realistic sample data in section 8 so the prototype looks real.
- Present mobile screens in a phone frame and the dashboard in a desktop browser frame.

## 8. Sample data (use in the prototype)

**Customer:** أحمد العتيبي / Ahmed Al-Otaibi — `0551234567`

**Shipments:**

| Number | Description | Current status | Last update |
|---|---|---|---|
| `AB7K2M9XQ4` | قطع غيار سيارات / Car spare parts | في الطريق / In transit | Today 10:30 |
| `KP3N8T5WZ2` | أجهزة إلكترونية / Electronics | تم التسليم / Delivered | Yesterday |
| `HX9R4C6VB7` | ملابس / Clothing | تم الاستلام / Received | 2 days ago |
| `MD2F7Y8LQ3` | أدوات منزلية / Home tools | مرتجع / Returned | 5 days ago |

**Timeline for `AB7K2M9XQ4`:**
- تم الاستلام / Received: 5 Oct, 09:15
- في الطريق / In transit: 6 Oct, 14:40 (note: "Left the warehouse")
- (current) في الطريق / In transit

Use realistic Saudi names, cities (Riyadh, Jeddah, Dammam), and +966 mobile formats.

## 9. React Native constraints (so the design is buildable)

- Design with **standard components**: lists, cards, text inputs, buttons, tab bar, bottom sheets, toasts. Avoid exotic custom animations or heavy effects.
- Respect **safe areas** (notch, home indicator) on iOS and Android.
- Use a consistent **8px spacing grid** and a small set of reusable components (button, input, status badge, shipment card, timeline item).
- Provide the design as **reusable components with defined states** (default, pressed, disabled, error).
- Define a small **design token set**: colors, type scale, spacing, radius. These map directly to a React Native theme object.
- Support **RTL** natively (the app will use React Native's RTL support), so avoid hard-coded left/right positioning in the design logic.
- Screens must work on small phones (about 360px wide) up to large phones.

## 10. Out of scope (do not design)

Drivers, GPS, maps, live location, proof of delivery (photo/OTP/signature), payments, COD, invoices, chat, social login, SMS OTP, carrier integrations.

## 11. Deliverables

1. Design tokens (colors, typography, spacing, radius) and a small component library.
2. All customer app screens in **Arabic (RTL) and English (LTR)**.
3. All admin dashboard screens (Arabic + English or at least Arabic with an English toggle).
4. A clickable prototype with the flows in section 7.
5. A short list of screens and components (screen inventory) I can use as a build checklist for React Native.
