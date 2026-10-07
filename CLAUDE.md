# Task: Build a client demo of the Shipment Tracking app and host it on GitHub Pages

## Goal

Build a **clickable, browser-based demo** of the Shipment Tracking product (customer mobile app + admin dashboard), based on the PRD and the Claude Design handoff, and **deploy it to GitHub Pages** so I can send the client a link.

This is a **demo, not the production app.** No real backend. All data is mocked. The real app will be built later in React Native (Expo), so the demo should reuse that stack and be easy to evolve.

## Inputs (read these first, in this order)

1. `docs/prd.md`: product requirements (source of truth for behavior and scope).
2. `docs/design-brief.md`: the brief that was given to Claude Design (scope, flows, sample data).
3. `docs/design-handoff/`: the Claude Design handoff (screens, design tokens, components, assets). **Follow it faithfully**: colors, typography, spacing, radius, component states, RTL/LTR layouts. If the handoff conflicts with the PRD, the PRD wins on behavior and the handoff wins on visuals. Tell me about any conflict.

If any of these are missing or unreadable, stop and tell me exactly what is missing before building.

## Tech decisions

- **Expo + React Native + `react-native-web`**, TypeScript, **Expo Router** for navigation.
- Export as a **static web build** (`npx expo export --platform web`) and host on GitHub Pages.
- One project, two areas:
  - `/` → the **customer mobile app** (shown inside a phone frame when the browser is wide, and full-screen on a real phone).
  - `/admin` → the **admin dashboard** (desktop-first layout).
- Put design tokens in a single theme file (colors, type scale, spacing, radius) taken from the handoff, and build reusable components: `Button`, `Input`, `StatusBadge`, `ShipmentCard`, `TimelineItem`, etc.
- Keep the code clean and structured, since it will become the base of the real app.

## Mock data layer (important)

- No server. Create a small **mock API module** (`src/mock/api.ts`) with the same shape the real API will have later (e.g. `getShipmentByCode`, `listMyShipments`, `login`, `addShipment`, `updateShipmentStatus`, `listStatuses`, `saveStatus`, `resetPassword`, `importExcel`).
- Persist the mock state in **`localStorage`** so the demo feels alive: **when I update a shipment status in `/admin`, the customer app shows the new status** (open both in the same browser). Add a hidden or footer **"Reset demo data"** action.
- Seed data: use the sample data from `docs/design-brief.md` section 8 (Saudi names, cities, +966 numbers, shipments `AB7K2M9XQ4`, `KP3N8T5WZ2`, `HX9R4C6VB7`, `MD2F7Y8LQ3`).
- Demo credentials (show them on the login screens as a small hint): customer `0551234567` / `demo1234`; admin `admin@demo.com` / `demo1234`.
- Push notifications: **simulate** them. When the admin updates a status, show an in-app toast/banner styled like a push notification in the customer view. No real push.
- Excel upload: parse a real `.xlsx` in the browser (SheetJS) or provide a one-click "Use sample file" so the 3-step flow (upload, preview, confirm) works in the demo.

## Functional scope (must work in the demo)

Customer app:
- Guest: Home → search by shipment number → result with status + timeline (no personal data) → "Log in to get notifications" banner. Uniform "Shipment not found" error.
- Login (mobile + password), forced password change after an admin reset, "Forgot password?" → contact-administration screen.
- My Shipments list (with search) → shipment details with vertical timeline.
- Settings: language (AR/EN), notifications toggle, change password, log out.
- **Arabic RTL (primary) and English LTR** with a language switch that fully mirrors the layout.
- States: loading skeleton, empty list, not found, error.

Admin dashboard:
- Staff login, shipments list (search, filters, pagination), add shipment (generates a random, non-guessable code, copyable), shipment details + update status with note + history.
- Excel upload: template, preview with error rows, confirm, download generated numbers.
- Customers list, create customer, **Reset password** (temporary password shown once, customer must change it at next login).
- Status management: add/edit/reorder, final-status toggle, send-push toggle, **deactivate instead of delete** when a status is in use.
- Settings: contact number shown under "Forgot password?".

Follow the PRD for rules (dynamic statuses, admin-only linking of shipments to customers, public lookup shows status and timeline only).

## Out of scope

Drivers, GPS, maps, proof of delivery, payments/COD, invoices, SMS OTP, real push, real backend, carrier integrations.

## Demo-specific requirements

- Add a small, tasteful **"Demo"** badge or footer note ("Interactive demo. Sample data only.").
- Add `<meta name="robots" content="noindex">` so the demo isn't indexed.
- **Use only fake data.** Do not include any real customer data, real client branding assets, or secrets in the repo.
- Placeholder brand name/logo from the handoff; keep it in one place so it's easy to replace.
- Must look good on: a phone (360px wide and up), and a desktop browser (customer app inside a phone frame, admin dashboard full width).

## Deployment: GitHub Pages

1. Check git state and `gh auth status`. If there's no remote repo or I'm not authenticated, **ask me** for the repo name (or create one with `gh repo create <name> --public` if I confirm). Note: GitHub Pages sites are publicly reachable by URL.
2. Configure the **base path** for project pages (`https://<user>.github.io/<repo>/`): set `experiments.baseUrl` in `app.json` (Expo Router) and make sure assets and routes work under that sub-path.
3. Handle **SPA deep links** on Pages: generate a `404.html` that redirects to `index.html` (or use the Expo static export routes), so refreshing `/admin` or `/shipment/...` doesn't 404. Add an empty `.nojekyll` file so folders starting with `_` (like `_expo`) are served.
4. Add a **GitHub Actions workflow** (`.github/workflows/deploy.yml`): on push to `main`, install deps, run `npx expo export --platform web`, upload the `dist` folder with `actions/upload-pages-artifact`, deploy with `actions/deploy-pages`. Set the needed `permissions` (`pages: write`, `id-token: write`, `contents: read`).
5. Enable Pages with source = **GitHub Actions** (`gh api` or tell me the exact click path in repo Settings → Pages).
6. Push, watch the workflow run, and **verify the live URL** works: home, search, login, admin, language switch, and a hard refresh on a deep link.

## Working style

- Start by listing the plan and any assumptions or conflicts you found in the inputs, then proceed without waiting unless something blocks you.
- Build in this order: theme and components → mock API → customer app → admin dashboard → polish and RTL → deploy.
- Test the main flows in a browser (desktop and a 360px mobile viewport) before deploying. Fix visual bugs, especially RTL mirroring.
- Commit in small, meaningful steps.

## Definition of done

- Live GitHub Pages URL that I can send to the client.
- All flows above work with the mock data, in Arabic and English.
- A `README.md` with: what the demo is, how to run it locally, how to redeploy, demo credentials, and how to reset demo data.
- A short summary from you with: the live URL, what's implemented, what's mocked, and anything you assumed or couldn't do.
