---
description: CRM Features Implementation Plan (08/01/2026)
---

# CRM Features Implementation Plan

## A) SUPER ADMIN + Discount Approval via Email Link + OTP + Dashboard

### A1) Super Admin Role
- [x] Add SUPER_ADMIN to User role enum
- [ ] Create super admin middleware for preview mode
- [ ] Add audit logging for all super admin actions
- [ ] Create "View as user" preview mode UI

### A2) Discount Approval Flow
- [ ] Update DiscountRequest model with new status enums
- [ ] Create secure token generation for email links
- [ ] Build email template for discount approval
- [ ] Create discount review page (token-based, no login)
- [ ] Implement OTP generation/verification (6-digit, 10min expiry, 5 attempts)
- [ ] Add approve/reject actions with audit logging
- [ ] Create API routes for OTP flow

### A3) Super Admin Discount Dashboard
- [ ] Create dashboard page with all discount requests
- [ ] Add filters (status, sales rep, date range, search)
- [ ] Build table with all required columns
- [ ] Add quick view modal
- [ ] Integrate OTP approval flow

## B) OPS DASHBOARD — Leads Click Flow + Details Cards + Status Pipeline

### B1) Fix Broken Leads Click Behavior
- [ ] Remove router.push from lead card click
- [ ] Ensure modal/drawer opens on same page
- [ ] Test click behavior

### B2) Keep Existing Ops Controls
- [ ] Verify remarks textarea exists
- [ ] Verify remarks history timeline
- [ ] Verify status pipeline: UNDER_PRINTING → UNDER_INSTALLATION → CLOSED
- [ ] Improve UI/structure only

### B3) Add Ops Details Cards
- [ ] Create Deal Summary Card (lead info, status, assigned team, dates)
- [ ] Create Pricing Summary Card (base, discount, final)
- [ ] Position cards at top of modal

### B4) Inventory / Campaign Details
- [ ] Create "Campaign / Inventory Details" section
- [ ] Display: location, address, city/state, size, unit price, schedule, notes
- [ ] Handle missing schedule gracefully

### B5) UI Compactness
- [ ] Modal: w-[96vw] max-w-4xl max-h-[85vh]
- [ ] Reduce spacing: gap-6 → gap-4, space-y-6 → space-y-4
- [ ] Card padding: p-6 → p-4
- [ ] Typography: text-xl → text-lg, text-base for cards, text-sm body
- [ ] Buttons/inputs: size="sm", h-9, text-sm
- [ ] ScrollArea for activity ~220px

## C) Role Assignment Persistence

### C1) Data Model Fix
- [ ] Verify sales_rep_id, finance_user_id, ops_user_id fields exist
- [ ] Create migration if needed
- [ ] Ensure fields are never cleared on status change

### C2) API Updates
- [ ] Update status change logic to preserve assignments
- [ ] Finance assignment sets only finance_user_id
- [ ] Ops assignment sets only ops_user_id
- [ ] Sales assignment remains permanent

### C3) UI Updates
- [ ] Display all three roles in "Assigned Team" section
- [ ] Show "Not assigned yet" for unassigned roles
- [ ] Update activity logs to show role in actions

### C4) Data Migration
- [ ] Backfill existing records if possible

## D) PAYMENT REMINDER SYSTEM

### D1) Payment Module Schema
- [ ] Create Payment model with status enum
- [ ] Add fields: invoice_no, amounts, due_date, client_commitment_date, etc.
- [ ] Add commitment_channel enum
- [ ] Create ReminderLog model

### D2) Reminder Rules
- [ ] Implement configurable reminder schedule
- [ ] PENDING: T-3, T-1, due today
- [ ] OVERDUE: +2, +5, +7 escalation
- [ ] PROMISED: -1, 0, +2 (then BROKEN_PROMISE)
- [ ] Rate limiting: max 1/24h per recipient
- [ ] Sending window: 9am-7pm IST

### D3) Promise Flow
- [ ] Create "Add Client Commitment" UI
- [ ] Capture date + channel + note
- [ ] Update status to PROMISED
- [ ] Adjust reminder schedule
- [ ] Auto-mark BROKEN_PROMISE if missed

### D4) Payment UI
- [ ] Create Payment Card in lead details
- [ ] Show total/paid/pending, dates, status
- [ ] Add action buttons (follow-up, commitment, update due date, mark paid)
- [ ] Create Finance Payments Queue dashboard
- [ ] Add filters and columns

### D5) Reminder Job
- [ ] Create cron job (hourly)
- [ ] Query payments where next_reminder_at <= now
- [ ] Send to CLIENT + SALES + FINANCE
- [ ] Log results
- [ ] Calculate next_reminder_at

### D6) Email Templates
- [ ] Client reminder template
- [ ] Internal reminder template
- [ ] Escalation template

## Security & Audit Checklist
- [ ] All super admin actions logged
- [ ] Secure token generation (signed, expiring, single-use)
- [ ] OTP hashing (bcrypt)
- [ ] Rate limiting on OTP attempts
- [ ] RBAC enforcement on all APIs
- [ ] Audit log for discount approvals
- [ ] Audit log for payment updates
