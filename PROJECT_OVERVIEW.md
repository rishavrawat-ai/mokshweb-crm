# Moksh Promotion Web Application - Documentation

## Project Overview
This is a modern **Customer Relationship Management (CRM)** and **Content Management System (CMS)** built for **Moksh Promotion**, a strategic media and OOH (Out-of-Home) campaign agency. The application serves two main purposes:
1.  **Public Website**: Showcases services, media assets (hoardings, petrol pumps), and allows clients to browse and cart items.
2.  **Internal Dashboard**: A comprehensive tool for Sales, Finance, Operations, and Admins to manage leads, inventory, projects, payments, and approvals.

## Technology Stack
-   **Framework**: Next.js 14+ (App Router)
-   **Language**: TypeScript
-   **Database**: SQLite (Development) / PostgreSQL (Production ready)
-   **ORM**: Prisma
-   **Styling**: Tailwind CSS
-   **UI Components**: Shadcn UI (Radix Primitives)
-   **Authentication**: NextAuth.js (JWT, Credentials, RBAC)
-   **Icons**: Lucide React

## Architecture & Directory Structure
The project follows the standard Next.js App Router structure:

### Core Directories
-   `app/(site)`: Public-facing pages (Home, Services, Cart).
-   `app/(dashboard)`: Internal protected dashboard pages.
-   `app/(auth)`: Login and authentication pages.
-   `app/api`: Backend API routes handling data and business logic.
-   `components`: Reusable UI components (buttons, inputs, tables).
-   `lib`: Utility functions, database connection, auth configuration.
-   `prisma`: Database schema and seed scripts.
-   `public`: Static assets (images, videos).

### Key Modules (Backend)
-   `api/leads`: Lead management (CRUD, status transitions).
-   `api/inventory`: Hoarding/Media inventory management.
-   `api/discount`: Discount approval workflow logic.
-   `api/users`: User management (Admin only).

## Authentication & Security
-   **Provider**: Credentials-based login (Email/Password).
-   **RBAC (Role-Based Access Control)**:
    -   `SUPER_ADMIN`: Full access, including user impersonation.
    -   `ADMIN`: System management, user creation, discount approvals.
    -   `SALES`: Lead generation, campaign planning, discount requests.
    -   `FINANCE`: Payment tracking, invoicing, revenue management.
    -   `OPERATIONS`: Execution, printing, installation, task management.
-   **Middleware**: Protected routes (`/dashboard/*`) enforce role checks ensuring users only access their designated areas.

## Database Models (Prisma)
### Core Entities
-   **User**: System users with Roles.
-   **Lead**: The central entity tracking a potential sale from "NEW" to "CLOSED".
    -   Statuses: `NEW`, `IN_PROGRESS`, `HANDOFF_TO_OPS`, `CLOSED`, etc.
    -   Assignments: Distinct fields for `salesUserId`, `financeUserId`, `opsUserId`.
-   **Project**: Converted from a Lead, represents interactions with an established Customer.
-   **InventoryHoarding**: Represents physical media assets (Location, Size, Price).
    -   Includes properties for `width`, `height`, `rate`, `printingCharge`.

### Workflows Models
-   **LeadPayment**: Tracks payment milestones, partial payments, and overdue reminders.
    -   Fields: `totalAmount`, `paidAmount`, `pendingAmount`, `dueDate`, `clientCommitmentDate`.
-   **DiscountRequest**: Manages the negotiation flow.
    -   Sales requests a % off.
    -   Admin approves/rejects (OTP/Email verification flow included).
    -   Generates a secure `DiscountCode`.
-   **AuditLog**: Tracks critical actions (who did what and when).

## Key Workflows
### 1. Lead Lifecycle
1.  **Creation**: Sales creates a Lead.
2.  **Campaign Selection**: Sales adds `InventoryHoarding` items to the Lead.
3.  **Pricing**: System calculates `Base Total`. Sales can request discounts.
4.  **Closing**: Lead moves to `DEAL_CLOSED` -> `HANDOFF_TO_OPS`.
5.  **Execution**: Ops team takes over for Printing/Installation.

### 2. Discount Approval
1.  Sales requests a discount > X%.
2.  Request is logged as `PENDING`.
3.  Admin receives notification/email.
4.  Admin approves -> System generates a magic code.
5.  Sales applies code to Lead -> Final Price is updated.

### 3. Payment & Reminders
1.  Finance raises an "Invoice" (or Payment Entry) for a Lead.
2.  Tracks `Promise to Pay` dates.
3.  System logs and sends reminders (Email/SMS/WhatsApp support implied in schema).

## Deployment & Setup
-   **Commands**:
    -   `npm run dev`: Start development server.
    -   `npx prisma studio`: View database UI.
    -   `npx prisma db push`: Sync schema changes.
-   **Environment Variables**: Managed in `.env` (Database URL, Auth Secret, SMTP, etc.).
