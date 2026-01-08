# 🔐 CRM System - User Credentials

**Last Updated**: 08/01/2026 12:15 PM IST

---

## 📋 ALL USER ACCOUNTS

### 1. Super Admin
- **Email**: `gohypedevelopers@gmail.com`
- **Password**: `SuperAdmin123!`
- **Role**: SUPER_ADMIN
- **Permissions**: All admin powers + discount approval + view as user
- **Created by**: `scripts/create-super-admin.ts`

---

### 2. Admin User
- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Role**: ADMIN
- **Permissions**: Full system access (except super admin features)
- **Created by**: `prisma/seed.ts`

---

### 3. Sales Team User
- **Email**: `sales@example.com`
- **Password**: `sales123`
- **Role**: SALES
- **Permissions**: Lead management, discount requests
- **Created by**: `prisma/seed.ts`

---

### 4. Sales Team User 2
- **Email**: `sales2@example.com`
- **Password**: `sales123`
- **Role**: SALES
- **Permissions**: Lead management, discount requests
- **Created by**: `prisma/seed.ts`

---

### 5. Finance Team User
- **Email**: `finance@example.com`
- **Password**: `finance123`
- **Role**: FINANCE
- **Permissions**: Payment management, finance dashboard
- **Created by**: `prisma/seed.ts`

---

### 6. Operations Team User
- **Email**: `ops@example.com`
- **Password**: `ops123`
- **Role**: OPERATIONS
- **Permissions**: Ops dashboard, printing/installation management
- **Created by**: `prisma/seed.ts`

---

## 🚀 QUICK LOGIN GUIDE

### For Testing Discount Approval:
1. **Login as Sales**: `sales@example.com` / `sales123`
   - Create a discount request
2. **Check Super Admin Email**: `gohypedevelopers@gmail.com`
   - Receive approval email
3. **Approve/Reject**: Use the link in email (no login needed)

### For Testing Payment System:
1. **Login as Finance**: `finance@example.com` / `finance123`
   - Create payments
   - View payments queue
2. **Login as Sales**: `sales@example.com` / `sales123`
   - Add client commitments
   - Add follow-up notes

### For Testing Ops Dashboard:
1. **Login as Ops**: `ops@example.com` / `ops123`
   - View leads
   - Update printing/installation status

---

## 🔄 RESET/CREATE USERS

### Create Super Admin
```bash
npx tsx scripts/create-super-admin.ts
```

### Seed All Users
```bash
npx prisma db seed
```

### Get All Users
```bash
npx tsx scripts/get-all-users.ts
```

---

## 🔒 SECURITY NOTES

1. **Production**: Change all passwords before deploying to production
2. **Passwords**: All passwords are hashed with bcrypt (10 rounds)
3. **Super Admin Email**: Configure in `.env` as `SUPER_ADMIN_EMAIL`
4. **Session**: Uses NextAuth with secure session tokens

---

## 📧 EMAIL CONFIGURATION

**Super Admin Email** (for discount approvals):
- Email: `gohypedevelopers@gmail.com`
- Configured in: `.env` as `SUPER_ADMIN_EMAIL`

**SMTP Settings** (for sending emails):
```env
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
```

---

## 🎯 ROLE PERMISSIONS MATRIX

| Feature | SUPER_ADMIN | ADMIN | SALES | FINANCE | OPERATIONS |
|---------|-------------|-------|-------|---------|------------|
| Discount Approval (OTP) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Discount Request | ❌ | ❌ | ✅ | ❌ | ❌ |
| View Discount Dashboard | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create Payment | ✅ | ✅ | ❌ | ✅ | ❌ |
| Mark Paid | ✅ | ✅ | ❌ | ✅ | ❌ |
| Add Commitment | ✅ | ✅ | ✅ | ✅ | ❌ |
| Add Follow-up | ✅ | ✅ | ✅ | ✅ | ❌ |
| View Payments Queue | ✅ | ✅ | ❌ | ✅ | ❌ |
| Ops Dashboard | ✅ | ✅ | ❌ | ❌ | ✅ |
| Lead Management | ✅ | ✅ | ✅ | ✅ | ✅ |
| User Management | ✅ | ✅ | ❌ | ❌ | ❌ |
| Audit Logs | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 🧪 TEST ACCOUNTS SUMMARY

**Quick Copy-Paste for Testing:**

```
Super Admin:
Email: gohypedevelopers@gmail.com
Password: SuperAdmin123!

Admin:
Email: admin@example.com
Password: admin123

Sales:
Email: sales@example.com
Password: sales123

Finance:
Email: finance@example.com
Password: finance123

Operations:
Email: ops@example.com
Password: ops123
```

---

## 📝 NOTES

- All passwords are stored as bcrypt hashes in the database
- Passwords cannot be retrieved, only reset
- Use Prisma Studio to view/edit users: `npx prisma studio`
- Default passwords are for development only
- Change all passwords in production environment

---

**Login URL**: `http://localhost:3000/login` (or your deployed URL)
