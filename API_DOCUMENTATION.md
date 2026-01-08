# CRM Features API Documentation

## 📋 Table of Contents
1. [Discount Approval System](#discount-approval-system)
2. [Payment Reminder System](#payment-reminder-system)
3. [Sample Payloads](#sample-payloads)
4. [Testing Guide](#testing-guide)

---

## 🎯 Discount Approval System

### 1. Create Discount Request (Sales Rep)

**Endpoint**: `POST /api/leads/[id]/discount-request`

**Auth**: Required (SALES role)

**Request Body**:
```json
{
  "requestedPercent": 15,
  "reason": "Client is a repeat customer with large order volume",
  "budgetDetails": "Client budget: ₹50,000. Competitor quote: ₹45,000",
  "campaignDetails": "5 premium locations in Mumbai for 3 months"
}
```

**Response**:
```json
{
  "success": true,
  "requestId": "clx1234567890",
  "message": "Discount request sent to Super Admin for approval"
}
```

**What Happens**:
- Creates discount request in database
- Generates secure token (24h expiry)
- Sends email to Super Admin with review link
- Logs action in audit trail

---

### 2. Get Discount Request Details (Super Admin - No Auth)

**Endpoint**: `GET /api/discount-review/[requestId]?token=xxx`

**Auth**: None (token-based)

**Response**:
```json
{
  "success": true,
  "request": {
    "id": "clx1234567890",
    "leadId": 123,
    "leadName": "Acme Corporation",
    "leadPhone": "+91 98765 43210",
    "leadEmail": "contact@acme.com",
    "salesRepName": "Rahul Sharma",
    "salesRepEmail": "rahul@moksh.com",
    "requestedPercent": 15,
    "baseTotal": 50000,
    "discountAmount": 7500,
    "finalTotal": 42500,
    "reason": "Client is a repeat customer...",
    "status": "PENDING",
    "campaignItems": [
      {
        "id": 1,
        "location": "Andheri West",
        "city": "Mumbai",
        "state": "Maharashtra",
        "rate": 10000,
        "total": 30000
      }
    ],
    "createdAt": "2026-01-08T10:00:00Z"
  }
}
```

---

### 3. Generate OTP (Super Admin)

**Endpoint**: `POST /api/discount-review/[requestId]/generate-otp`

**Auth**: None (token-based)

**Request Body**:
```json
{
  "token": "abc123def456..."
}
```

**Response**:
```json
{
  "success": true,
  "message": "OTP sent to super admin email",
  "expiresAt": "2026-01-08T10:10:00Z"
}
```

**What Happens**:
- Verifies secure token
- Generates 6-digit OTP
- Hashes OTP (bcrypt)
- Sends OTP email
- Updates status to OTP_SENT
- Increments attempt counter (max 5)

---

### 4. Approve Discount (Super Admin)

**Endpoint**: `POST /api/discount-review/[requestId]/approve`

**Auth**: None (token + OTP verification)

**Request Body**:
```json
{
  "token": "abc123def456...",
  "otp": "123456",
  "approvedPercent": 12,
  "comment": "Approved 12% instead of 15% due to margin constraints"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Discount approved successfully",
  "approvedPercent": 12,
  "finalTotal": 44000
}
```

**What Happens**:
- Verifies token + OTP
- Updates discount request status to APPROVED
- Updates lead pricing (discountPercentApplied, discountAmount, finalTotal)
- Logs approval in audit trail
- Sends notification to sales rep (future)

---

### 5. Reject Discount (Super Admin)

**Endpoint**: `POST /api/discount-review/[requestId]/reject`

**Auth**: None (token + OTP verification)

**Request Body**:
```json
{
  "token": "abc123def456...",
  "otp": "123456",
  "rejectionReason": "Discount exceeds maximum allowed threshold for this category"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Discount request rejected"
}
```

---

### 6. Get All Discount Requests (Super Admin Dashboard)

**Endpoint**: `GET /api/super-admin/discount-requests`

**Auth**: Required (SUPER_ADMIN or ADMIN role)

**Query Params**:
- `status`: PENDING | UNDER_REVIEW | OTP_SENT | APPROVED | REJECTED
- `salesRepId`: Filter by sales rep ID
- `search`: Search by lead name, phone, or request ID
- `dateFrom`: ISO date string
- `dateTo`: ISO date string

**Example**: `/api/super-admin/discount-requests?status=PENDING&dateFrom=2026-01-01`

**Response**:
```json
{
  "success": true,
  "total": 5,
  "requests": [
    {
      "id": "clx1234567890",
      "leadId": 123,
      "leadName": "Acme Corporation",
      "leadPhone": "+91 98765 43210",
      "leadEmail": "contact@acme.com",
      "salesRep": {
        "id": 5,
        "name": "Rahul Sharma",
        "email": "rahul@moksh.com"
      },
      "requestedPercent": 15,
      "approvedPercent": null,
      "baseTotal": 50000,
      "finalTotal": 42500,
      "reason": "Client is a repeat customer...",
      "rejectionReason": null,
      "status": "PENDING",
      "campaignCount": 5,
      "requestedAt": "2026-01-08T10:00:00Z",
      "approvedAt": null,
      "createdAt": "2026-01-08T10:00:00Z",
      "updatedAt": "2026-01-08T10:00:00Z"
    }
  ]
}
```

---

## 💰 Payment Reminder System

### 1. Create/Update Payment (Finance)

**Endpoint**: `POST /api/leads/[id]/payment`

**Auth**: Required (FINANCE, ADMIN, or SUPER_ADMIN role)

**Request Body**:
```json
{
  "invoiceNo": "INV-2026-001",
  "totalAmount": 50000,
  "dueDate": "2026-01-15T00:00:00Z",
  "status": "PENDING"
}
```

**Response**:
```json
{
  "success": true,
  "payment": {
    "id": 1,
    "leadId": 123,
    "status": "PENDING",
    "invoiceNo": "INV-2026-001",
    "totalAmount": 50000,
    "paidAmount": 0,
    "pendingAmount": 50000,
    "dueDate": "2026-01-15T00:00:00Z",
    "nextReminderAt": "2026-01-12T09:00:00Z",
    "createdAt": "2026-01-08T10:00:00Z"
  }
}
```

---

### 2. Get Payment Details

**Endpoint**: `GET /api/leads/[id]/payment`

**Auth**: Required (Any authenticated user)

**Response**:
```json
{
  "success": true,
  "payment": {
    "id": 1,
    "leadId": 123,
    "status": "PARTIAL",
    "invoiceNo": "INV-2026-001",
    "totalAmount": 50000,
    "paidAmount": 20000,
    "pendingAmount": 30000,
    "dueDate": "2026-01-15T00:00:00Z",
    "clientCommitmentDate": "2026-01-20T00:00:00Z",
    "commitmentChannel": "WHATSAPP",
    "commitmentNote": "Client confirmed payment by Jan 20",
    "lastFollowupAt": "2026-01-08T14:30:00Z",
    "lastFollowupNote": "Spoke with finance head, payment approved",
    "nextReminderAt": "2026-01-19T09:00:00Z",
    "transactions": [
      {
        "id": 1,
        "amount": 20000,
        "mode": "UPI",
        "transactionRef": "UPI123456789",
        "paidAt": "2026-01-08T14:00:00Z"
      }
    ],
    "followupNotes": [
      {
        "id": 1,
        "note": "Spoke with finance head, payment approved",
        "createdBy": 3,
        "createdAt": "2026-01-08T14:30:00Z"
      }
    ],
    "reminderLogs": [
      {
        "id": 1,
        "recipientType": "CLIENT",
        "recipientEmail": "contact@acme.com",
        "channel": "EMAIL",
        "status": "SENT",
        "sentAt": "2026-01-05T09:00:00Z"
      }
    ]
  }
}
```

---

### 3. Mark Payment (Full or Partial)

**Endpoint**: `POST /api/leads/[id]/payment/mark-paid`

**Auth**: Required (FINANCE, ADMIN, or SUPER_ADMIN role)

**Request Body**:
```json
{
  "amount": 20000,
  "mode": "UPI",
  "transactionRef": "UPI123456789",
  "proofUrl": "https://example.com/proof.pdf",
  "notes": "Partial payment received via UPI"
}
```

**Response**:
```json
{
  "success": true,
  "payment": {
    "id": 1,
    "status": "PARTIAL",
    "totalAmount": 50000,
    "paidAmount": 20000,
    "pendingAmount": 30000
  },
  "transaction": {
    "id": 1,
    "amount": 20000,
    "mode": "UPI",
    "transactionRef": "UPI123456789",
    "paidAt": "2026-01-08T14:00:00Z"
  }
}
```

---

### 4. Add Client Commitment (Promise to Pay)

**Endpoint**: `POST /api/leads/[id]/payment/add-commitment`

**Auth**: Required (SALES, FINANCE, ADMIN, or SUPER_ADMIN role)

**Request Body**:
```json
{
  "commitmentDate": "2026-01-20T00:00:00Z",
  "channel": "WHATSAPP",
  "note": "Client confirmed payment by Jan 20 via WhatsApp. Finance head approved."
}
```

**Commitment Channels**:
- `VERBAL` - Phone call or in-person
- `WHATSAPP` - WhatsApp message
- `EMAIL` - Email confirmation
- `OTHER` - Other channel

**Response**:
```json
{
  "success": true,
  "payment": {
    "id": 1,
    "status": "PROMISED",
    "clientCommitmentDate": "2026-01-20T00:00:00Z",
    "commitmentChannel": "WHATSAPP",
    "commitmentNote": "Client confirmed payment by Jan 20...",
    "nextReminderAt": "2026-01-19T09:00:00Z"
  }
}
```

**What Happens**:
- Updates payment status to PROMISED
- Sets commitment date and channel
- Adjusts reminder schedule:
  - -1 day before commitment
  - On commitment date
  - +2 days after (if unpaid, marks BROKEN_PROMISE)
- Creates follow-up note

---

### 5. Add Follow-up Note

**Endpoint**: `POST /api/leads/[id]/payment/add-followup`

**Auth**: Required (SALES, FINANCE, ADMIN, or SUPER_ADMIN role)

**Request Body**:
```json
{
  "note": "Spoke with finance head. Payment approved, will be processed by Jan 20."
}
```

**Response**:
```json
{
  "success": true,
  "followupNote": {
    "id": 1,
    "leadPaymentId": 1,
    "note": "Spoke with finance head...",
    "createdBy": 3,
    "createdAt": "2026-01-08T14:30:00Z"
  }
}
```

---

### 6. Get Finance Payments Queue

**Endpoint**: `GET /api/finance/payments-queue`

**Auth**: Required (FINANCE, ADMIN, or SUPER_ADMIN role)

**Query Params**:
- `filter`: due_today | this_week | overdue | promised | broken_promise
- `status`: PENDING | PARTIAL | OVERDUE | PROMISED | BROKEN_PROMISE | PAID
- `search`: Search by lead name, phone, or invoice number

**Example**: `/api/finance/payments-queue?filter=overdue&search=Acme`

**Response**:
```json
{
  "success": true,
  "total": 3,
  "payments": [
    {
      "id": 1,
      "leadId": 123,
      "leadName": "Acme Corporation",
      "leadPhone": "+91 98765 43210",
      "leadEmail": "contact@acme.com",
      "invoiceNo": "INV-2026-001",
      "totalAmount": 50000,
      "paidAmount": 20000,
      "pendingAmount": 30000,
      "dueDate": "2026-01-05T00:00:00Z",
      "clientCommitmentDate": "2026-01-20T00:00:00Z",
      "commitmentChannel": "WHATSAPP",
      "status": "OVERDUE",
      "salesRep": {
        "id": 5,
        "name": "Rahul Sharma",
        "email": "rahul@moksh.com",
        "phone": "+91 98765 11111"
      },
      "financeUser": {
        "id": 3,
        "name": "Neha Patel",
        "email": "neha@moksh.com"
      },
      "lastFollowupAt": "2026-01-08T14:30:00Z",
      "lastFollowupNote": "Spoke with finance head...",
      "lastReminderSent": "2026-01-07T09:00:00Z",
      "nextReminderAt": "2026-01-09T09:00:00Z"
    }
  ]
}
```

---

## 📝 Sample Payloads

### Payment Status Flow

```
NOT_RAISED → PENDING → PARTIAL → PAID
                ↓
            OVERDUE
                ↓
            PROMISED → BROKEN_PROMISE
```

### Reminder Schedule Examples

**PENDING Payment (Due: Jan 15)**:
- Jan 12 09:00 - T-3 reminder
- Jan 14 09:00 - T-1 reminder
- Jan 15 09:00 - Due today reminder

**OVERDUE Payment (Due: Jan 5, Today: Jan 10)**:
- Jan 7 09:00 - +2 days reminder
- Jan 10 09:00 - +5 days reminder
- Jan 12 09:00 - +7 days escalation

**PROMISED Payment (Commitment: Jan 20)**:
- Jan 19 09:00 - -1 day before promise
- Jan 20 09:00 - On promise date
- Jan 22 09:00 - +2 days after (if unpaid → BROKEN_PROMISE)

---

## 🧪 Testing Guide

### 1. Test Discount Approval Flow

```bash
# Step 1: Create discount request (as Sales)
curl -X POST http://localhost:3000/api/leads/123/discount-request \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "requestedPercent": 15,
    "reason": "Repeat customer with large order",
    "budgetDetails": "Client budget: ₹50,000"
  }'

# Step 2: Check email for review link
# Click link or copy token from email

# Step 3: Open review page
# http://localhost:3000/discount-review/[requestId]?token=xxx

# Step 4: Generate OTP (in browser)
# Click "Generate OTP" button

# Step 5: Check email for OTP

# Step 6: Enter OTP and approve/reject (in browser)
```

### 2. Test Payment Reminder System

```bash
# Step 1: Create payment (as Finance)
curl -X POST http://localhost:3000/api/leads/123/payment \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "invoiceNo": "INV-2026-001",
    "totalAmount": 50000,
    "dueDate": "2026-01-15T00:00:00Z",
    "status": "PENDING"
  }'

# Step 2: Add client commitment
curl -X POST http://localhost:3000/api/leads/123/payment/add-commitment \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "commitmentDate": "2026-01-20T00:00:00Z",
    "channel": "WHATSAPP",
    "note": "Client confirmed payment by Jan 20"
  }'

# Step 3: Mark partial payment
curl -X POST http://localhost:3000/api/leads/123/payment/mark-paid \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "amount": 20000,
    "mode": "UPI",
    "transactionRef": "UPI123456789"
  }'

# Step 4: Get payments queue
curl http://localhost:3000/api/finance/payments-queue?filter=promised \
  -H "Cookie: next-auth.session-token=..."
```

### 3. Test Super Admin Dashboard

```bash
# Get all discount requests
curl http://localhost:3000/api/super-admin/discount-requests \
  -H "Cookie: next-auth.session-token=..."

# Filter by status
curl http://localhost:3000/api/super-admin/discount-requests?status=PENDING \
  -H "Cookie: next-auth.session-token=..."

# Search by lead name
curl "http://localhost:3000/api/super-admin/discount-requests?search=Acme" \
  -H "Cookie: next-auth.session-token=..."
```

---

## 🔒 Security Notes

1. **Discount Approval**:
   - Token is single-use and expires in 24 hours
   - OTP expires in 10 minutes
   - Maximum 5 OTP generation attempts per request
   - All actions logged in audit trail

2. **Payment System**:
   - Only FINANCE, ADMIN, SUPER_ADMIN can create/update payments
   - SALES can add commitments and follow-ups
   - All transactions are logged
   - Reminder sending window: 9am-7pm IST only

3. **Rate Limiting**:
   - Max 1 reminder per recipient per 24 hours
   - Max 5 OTP attempts per discount request

---

## 📧 Email Configuration

Required environment variables:

```env
SUPER_ADMIN_EMAIL=gohypedevelopers@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
NEXTAUTH_URL=http://localhost:3000
```

---

## 🚀 Next Steps

1. Run database migration
2. Test all API endpoints
3. Build UI components
4. Implement cron job for payment reminders
5. Add in-app notifications
6. Create backfill script for role assignments

---

**Last Updated**: 08/01/2026
**Version**: 1.0.0
