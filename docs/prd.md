# PRD — Shipment Tracking System (Saudi Arabia)

**Version:** 0.1 (Draft)
**Date:** 2026-10-07
**Status:** Draft for client review

---

## 1. Overview

A simple shipment tracking system made of two parts:

1. **Admin dashboard (web):** staff create shipments and update their status manually.
2. **Customer app (mobile):** customers look up a shipment by its number, or log in to see all their shipments and their statuses.

The client has no existing system, and there are no drivers or proof of delivery. Status is updated manually by the admin team only. End users are non-technical, so simplicity is the top priority.

## 2. Goals and Out of Scope

### Goals
- Customers can find a shipment's status in as few steps as possible.
- Admin staff can add shipments and update statuses easily (one by one or via Excel).
- Customers receive a push notification when a status changes.

### Out of scope (v1)
- Driver app, GPS tracking, or maps.
- Proof of delivery (photo / OTP / signature).
- Integration with shipping carriers or external systems (ERP / stores).
- Online payment, cash on delivery (COD), or e-invoicing (ZATCA).
- SMS OTP login (deferred, see Section 9).

## 3. Users and Permissions

| Role | Platform | Permissions |
|---|---|---|
| Guest (no account) | Mobile app | Look up a shipment by number and view its status only |
| Customer (registered) | Mobile app | Everything above + see all their shipments + receive push notifications |
| Admin staff | Web dashboard | Add shipments, update status, manage customers |
| Admin (manager) | Web dashboard | Everything above + manage statuses and staff |

> **Open:** number of admin staff, and whether a customer is one company or multiple accounts (see Section 12).

## 4. Main User Flows

**A. Guest**
1. Opens the app and enters a shipment number.
2. Sees the current status and the timeline.

**B. Registered customer**
1. Logs in (mobile + password).
2. Sees a list of all their shipments with the current status of each.
3. Opens a shipment to see its timeline.
4. Receives a push notification when the status changes.

**C. Admin**
1. Logs into the dashboard and adds a shipment (single or Excel upload), linking it to a customer by mobile number.
2. The system generates the shipment number.
3. Later updates the status, which is recorded in the timeline and triggers a push notification to the customer.

## 5. Functional Requirements

### 5.1 Admin Dashboard (Web)
- Staff login.
- **Add shipment:** customer (by mobile) + optional description + initial status.
- **Update shipment status:** pick a new status + optional note.
- **Shipment list:** search by number or customer mobile; filter by status and date.
- **Customer management:** create customer accounts and reset passwords (see 5.6).
- **Status management** (see 5.4).
- **Excel upload** (see 5.5).

### 5.2 Customer App (Mobile)
- Home screen with a prominent, easy search box for the shipment number.
- Login with mobile + password.
- "My shipments" list showing each shipment's current status.
- Shipment details screen with a **timeline** of statuses (date and time of each).
- Arabic + English with RTL/LTR support.
- Simplified UI: large text, clear buttons, as few screens as possible.

### 5.3 Linking Shipments to Customers
- **Admin only** links a shipment to a customer account (by mobile number).
- Customers cannot add a shipment to their own account.
- If the mobile number has no account yet, the admin can create the account, or register the shipment and link it once the account exists.

### 5.4 Dynamic Statuses
Statuses are not hardcoded. The admin controls them from the dashboard.

**Initial statuses:** Received → In transit → Arrived / Delivered → Returned / Cancelled

**Each status has:**
- An Arabic name and an English name.
- A display order.
- A color or icon (to distinguish it in the timeline).
- Whether it is a final status (Delivered, Returned, Cancelled).
- Whether selecting it sends a push notification (default: yes).

**Rules:**
- Admins can add new statuses and edit their names and order.
- **A status used by shipments cannot be deleted.** It can only be deactivated, so the history of old shipments stays intact.
- Renaming a status is reflected in old shipments as well.

### 5.5 Excel Upload
- Downloadable Excel template from the dashboard.
- Suggested columns: customer mobile, shipment description (optional), initial status (optional).
- A **preview step** before saving: shows the number of valid rows and rows with errors.
- Clear error report (row number + reason).
- After saving, shipment numbers are generated and a file with the new numbers is available for download.
- Maximum rows per file (suggested: 1,000).

### 5.6 Passwords and Reset

**Problem:** Mobile + password login without SMS means there is no automatic way to recover a password, and the users are non-technical and will forget passwords.

**Solution for v1:**
- On the login screen, "Forgot password?" shows a simple message: "Contact the administration to reset your password" (with an editable contact number set from the dashboard).
- From the dashboard, the admin performs a **Reset** for the customer, and the system generates a **temporary password**.
- The customer is **forced to change the password** on first login with the temporary password.
- The temporary password is shown to staff only once at generation, and is communicated to the customer outside the system (phone / WhatsApp).
- Every reset is logged (who did it and when).

**Later (optional):** add SMS OTP for self-service password recovery (requires a CST-licensed SMS provider and per-message cost).

## 6. Notifications (Push)

- A push notification is sent to the **registered** customer when the status of one of their shipments changes.
- Notification text: shipment number + new status, in the language selected in the app.
- **Guests (no account) will not receive push notifications.** There is no way to tie them to a device without registration.
  - Suggested improvement: on the search result screen, if the shipment is linked to an account, show "Log in to receive notifications."
- Notifications can be turned on/off in app settings.

## 7. Shipment Number and Security

**Problem:** Public lookup (no account) + sequential numbers (1, 2, 3...) means anyone can guess numbers and see other people's shipments.

**Decisions:**
- The shipment number is **system-generated, random, and not guessable**, not sequential.
  - Suggested: a 10 to 12 character code using unambiguous letters and digits (no 0/O and 1/I/L), optionally with a fixed client prefix.
  - The number must be **unique** in the database.
- **Rate limiting** on public lookup (a limited number of attempts per device/IP per minute).
- Public lookup results show the **minimum only:** status + timeline. They **do not show** the customer name, mobile, or any personal data.
- One uniform message when the number is wrong ("Shipment not found") with no further detail.
- HTTPS only.

## 8. Non-Functional Requirements

- **Usability:** non-technical users, so as few taps as possible to reach a status.
- **Languages:** Arabic + English, RTL/LTR.
- **Platforms:** Android + iOS + web dashboard.
- **Hosting:** no data residency requirement inside Saudi Arabia (any hosting).
- **Performance:** lookup results in under 2 seconds under normal conditions.
- **Security:** hashed passwords, role-based permissions, audit log for sensitive actions.
- **Backups:** daily database backup.
- **Privacy:** since customer mobile numbers are stored, confirm the client's compliance with the Personal Data Protection Law (PDPL).

## 9. Login

- **v1:** mobile number + password (simplest for users, with no SMS cost).
- **Deferred:** SMS OTP (higher security, but requires a CST-licensed provider and a per-message cost).

## 10. Data Model (Initial Proposal)

- **users:** id, name, mobile (unique), password_hash, role, must_change_password, created_at
- **shipments:** id, tracking_code (unique), customer_id, description, current_status_id, created_at
- **statuses:** id, name (ar/en), sort_order, color/icon, is_final, send_push, is_active
- **shipment_status_history:** id, shipment_id, status_id, note, changed_by (user_id), created_at
- **device_tokens:** id, user_id, token, platform
- **audit_log:** id, action, user_id, details, created_at

## 11. Suggested Implementation Phases

1. **Foundation:** database, authentication, dynamic statuses.
2. **Dashboard:** add shipment, update status, customer management, password reset.
3. **Customer app:** lookup, login, shipments list, timeline.
4. **Notifications:** push on status change.
5. **Excel:** bulk upload with preview and error report.
6. **Testing and launch:** trial with non-technical users, adjust the UI based on feedback.

## 12. Open Questions (for the Client)

- How many admin staff will use the dashboard? Are different permissions needed between them?
- Is the client one company with one account, or could there be multiple accounts/branches?
- Who creates the initial customer accounts? (Admin manually, or imported from Excel?)
- The contact number to show under "Forgot password?".
- Expected maximum number of shipments per day and per month (for hosting planning).
- Is specific branding (name, logo, colors) required for the app?
- Are reports or data export needed from the dashboard?
