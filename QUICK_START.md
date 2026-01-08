# 🚀 CRM Features - Quick Start Guide

## ⚠️ BEFORE YOU START

### 1. Stop Dev Server
```bash
# Press Ctrl+C in the terminal running npm run dev
```

### 2. Run Database Migration
```bash
npx prisma migrate dev --name add_payment_system_and_super_admin
npx prisma generate
```

### 3. Update .env
```env
SUPER_ADMIN_EMAIL=gohypedevelopers@gmail.com
```

### 4. Restart Dev Server
```bash
npm run dev
```

---

## 📊 WHAT'S BEEN IMPLEMENTED

### ✅ Backend (100% Complete)
- 11 API routes
- 4 new database models
- Secure token + OTP system
- Email templates
- Payment reminder logic
- Audit logging

### ⏳ Frontend (20% Complete)
- ✅ Discount review page
- ⏳ Super admin dashboard
- ⏳ Finance payments queue
- ⏳ Ops modal improvements
- ⏳ Payment cards

---

## 🎯 KEY FEATURES

### A) Discount Approval (Email + OTP)
**Flow**: Sales → Email to Super Admin → Review Link → OTP → Approve/Reject

**Try it**:
1. Create discount request: `POST /api/leads/123/discount-request`
2. Check email for review link
3. Open link (no login needed)
4. Generate OTP
5. Enter OTP and approve/reject

### B) Payment Reminders (Automated)
**Flow**: Finance creates payment → Auto reminders → Client + Sales + Finance

**Try it**:
1. Create payment: `POST /api/leads/123/payment`
2. Add commitment: `POST /api/leads/123/payment/add-commitment`
3. Mark paid: `POST /api/leads/123/payment/mark-paid`
4. View queue: `GET /api/finance/payments-queue`

### C) Ops Dashboard (Improved)
**Changes**:
- ✅ No navigation on lead click (modal opens)
- ✅ Shows Sales + Finance + Ops assignments
- ✅ Compact UI design
- ⏳ UI implementation pending

### D) Role Persistence
**Rule**: Sales/Finance/Ops assignments NEVER cleared once set

---

## 📁 IMPORTANT FILES

### Documentation
- `FINAL_SUMMARY.md` - Complete overview
- `API_DOCUMENTATION.md` - API reference with examples
- `CRM_IMPLEMENTATION_SUMMARY.md` - Detailed implementation

### Code
- `lib/constants.ts` - All enums
- `lib/discount-utils.ts` - Token/OTP/reminder logic
- `lib/email-templates.ts` - Email templates
- `scripts/payment-reminders-cron.ts` - Cron job

### API Routes
```
app/api/
├── leads/[id]/
│   ├── discount-request/route.ts
│   └── payment/
│       ├── route.ts
│       ├── mark-paid/route.ts
│       ├── add-commitment/route.ts
│       └── add-followup/route.ts
├── discount-review/[requestId]/
│   ├── route.ts
│   ├── generate-otp/route.ts
│   ├── approve/route.ts
│   └── reject/route.ts
├── super-admin/
│   └── discount-requests/route.ts
└── finance/
    └── payments-queue/route.ts
```

---

## 🧪 QUICK TEST

### Test Discount Approval
```bash
# 1. Create request (replace session token)
curl -X POST http://localhost:3000/api/leads/1/discount-request \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{"requestedPercent":15,"reason":"Test discount"}'

# 2. Check email for link
# 3. Open link in browser
# 4. Click "Generate OTP"
# 5. Check email for OTP
# 6. Enter OTP and approve
```

### Test Payment System
```bash
# 1. Create payment
curl -X POST http://localhost:3000/api/leads/1/payment \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{"invoiceNo":"INV-001","totalAmount":50000,"dueDate":"2026-01-15T00:00:00Z"}'

# 2. View payments queue
curl http://localhost:3000/api/finance/payments-queue \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

---

## 🔧 SETUP CRON JOB

### Option 1: Vercel Cron (Recommended for Production)
Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/payment-reminders",
      "schedule": "0 * * * *"
    }
  ]
}
```

Create `app/api/cron/payment-reminders/route.ts`:
```typescript
import { runPaymentReminders } from "@/scripts/payment-reminders-cron";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  await runPaymentReminders();
  return NextResponse.json({ success: true });
}
```

### Option 2: Node-Cron (Local/Self-Hosted)
```bash
npm install node-cron @types/node-cron
```

Create `server.ts`:
```typescript
import cron from "node-cron";
import { runPaymentReminders } from "./scripts/payment-reminders-cron";

// Run every hour
cron.schedule("0 * * * *", async () => {
  console.log("Running payment reminders cron...");
  await runPaymentReminders();
});
```

---

## 🎨 UI COMPONENTS TO BUILD

### Priority Order

1. **Super Admin Discount Dashboard** (4-6 hours)
   - Table with filters
   - Status badges
   - Search functionality
   - Quick view modal

2. **Finance Payments Queue** (4-6 hours)
   - Table with filters
   - Payment status badges
   - Quick action buttons
   - Add commitment modal
   - Mark paid modal

3. **Ops Dashboard Improvements** (3-4 hours)
   - Update lead click behavior (modal, no navigation)
   - Add deal summary card
   - Add pricing summary card
   - Add campaign details section
   - Make UI compact

4. **Payment Card Component** (2-3 hours)
   - Display in lead details
   - Show payment status
   - Action buttons
   - Follow-up notes

---

## ⚡ COMMON ISSUES

### Database Locked
**Problem**: Migration fails with "database is locked"
**Solution**: Stop dev server first (`Ctrl+C`), then run migration

### Email Not Sending
**Problem**: OTP/reminders not received
**Solution**: Check SMTP credentials in `.env`

### Token Invalid
**Problem**: Discount review link shows "Invalid token"
**Solution**: Check `NEXTAUTH_URL` in `.env` matches your current URL

### OTP Expired
**Problem**: OTP doesn't work
**Solution**: OTP expires in 10 minutes. Generate new one.

---

## 📞 NEED HELP?

1. Check `API_DOCUMENTATION.md` for API examples
2. Check `FINAL_SUMMARY.md` for complete overview
3. Check `CRM_IMPLEMENTATION_SUMMARY.md` for details

---

## ✅ CHECKLIST

Before testing:
- [ ] Dev server stopped
- [ ] Migration run successfully
- [ ] Prisma client generated
- [ ] `.env` updated with SUPER_ADMIN_EMAIL
- [ ] Dev server restarted
- [ ] Super admin user created

After testing:
- [ ] Discount approval flow works
- [ ] Payment creation works
- [ ] Payment reminders scheduled
- [ ] Emails sending correctly
- [ ] Audit logs created

---

## 🎯 NEXT ACTIONS

1. **Immediate**: Run database migration
2. **Today**: Test all API endpoints
3. **This Week**: Build UI components
4. **Next Week**: Deploy cron job

---

**Status**: 70% Complete  
**Estimated Time to Finish**: 8-12 hours  
**Last Updated**: 08/01/2026
