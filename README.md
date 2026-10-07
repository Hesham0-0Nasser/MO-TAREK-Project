# Shipment Tracker: interactive demo

A clickable, browser-based demo of a shipment tracking product for Saudi Arabia: a **customer mobile app** (Arabic RTL first, English LTR) and an **admin dashboard**. It is a demo, not the production app. There is no backend; all data is fake and lives in the browser's `localStorage`.

- Built with Expo + React Native + `react-native-web`, TypeScript, Expo Router.
- `/` is the customer app (inside a phone frame on wide screens, full screen on a phone).
- `/admin` is the staff dashboard.
- Specs: `docs/prd.md` (behaviour), `docs/design-brief.md` and `docs/design-handoff/` (visuals).

## Demo credentials

| Area | Login | Password |
|---|---|---|
| Customer app | `0551234567` (Ahmed Al-Otaibi) | `demo1234` |
| Admin dashboard | `admin@demo.com` (manager) | `demo1234` |

Sample shipment numbers for guest lookup: `AB7K2M9XQ4`, `KP3N8T5WZ2`, `HX9R4C6VB7`, `MD2F7Y8LQ3`.
Customer `0532468135` / `demo1234` has no shipments (shows the empty state).

## Try this in two browser tabs

1. Tab A: `/` → log in as the customer → open **My shipments**.
2. Tab B: `/admin` → log in → open a shipment → pick a new status → **Save status**.
3. Tab A updates immediately and shows a push-style notification banner (tap it to open the shipment).

Other flows: guest search, language switch (full mirror), forgot password → contact screen, admin **Reset password** (temporary password is shown once; the customer must change it at next login), Excel upload (3 steps, or **Use sample file**), status management (add, edit, reorder by drag or arrows, deactivate instead of delete when in use).

## Run locally

```bash
npm install
npx expo start --web
```

Note: `app.json` sets `experiments.baseUrl` for GitHub Pages. In dev, open the root URL (`http://localhost:8081/`).

Typecheck: `npm run typecheck`.

## Build and redeploy

```bash
npm run build      # expo export --platform web, then scripts/postbuild.js
```

`postbuild.js` injects the no-index meta and fonts, writes `dist/404.html` (copy of `index.html`, so a refresh on `/admin` or `/shipment/<code>` works on Pages) and `dist/.nojekyll`.

Deployment is automatic: every push to `main` runs `.github/workflows/deploy.yml` (typecheck, build, publish `dist` to GitHub Pages). Run it manually from the repo's **Actions** tab with "Run workflow". If the repo name changes, update `experiments.baseUrl` in `app.json` to `/<repo-name>`.

Pages setup (one time): repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Reset demo data

Use **Reset demo data** in the footer of the admin sidebar, in Settings in the customer app, or under the phone frame. You can also clear the site's `localStorage` in the browser.

## What is mocked

Everything. `src/mock/api.ts` has the same shape the real API will have (`getShipmentByCode`, `listMyShipments`, `login`, `addShipment`, `updateShipmentStatus`, `listStatuses`, `saveStatus`, `resetPassword`, `importExcel` in `src/mock/excel.ts`, and so on). Push notifications are simulated in-app. Guest lookup has a simple rate limit (12 attempts per minute). Passwords are stored in plain text in `localStorage` because this is demo data only; the real app must hash them.

## Project layout

```
src/theme/        design tokens (from the handoff) and the placeholder brand (brand.ts)
src/components/   Button, Input, StatusBadge, ShipmentCard, Timeline, TabBar, PhoneFrame, admin shell...
src/i18n/         Arabic/English strings, language provider
src/mock/         types, seed data, localStorage store, mock API, Excel import
src/app/          Expo Router routes: (customer) group at "/", admin/ at "/admin"
```

To rebrand, edit `src/theme/brand.ts` and `color.primary` in `src/theme/index.ts`.

## Out of scope

Drivers, GPS/maps, proof of delivery, payments/COD, invoices, SMS OTP, real push, real backend, carrier integrations.
