# Updated Performance Optimization Implementation Plan

## Goal Description
Apply comprehensive performance improvements across the EduTrack SaaS backend and frontend while preserving all existing business logic, UI layout, validations, and tenant isolation.

## New Requirements
1. Add **all** PostgreSQL indexes listed in the audit report.
2. Eliminate N+1 query patterns in:
   - `BillingService.searchStudents()`
   - `StudentsService` (student search, details, promotion, etc.)
   - `DashboardService`
   - `AttendanceService`
3. Replace independent sequential DB calls with `Promise.all` where applicable.
4. Optimize dashboard card queries (total students, teachers, classes, revenue, expenses, net income, recent admissions, recent payments, financial overview).
5. Add frontend caching (SWR) to ensure instant data display on tab navigation with silent background refresh.
6. Remove duplicate API calls on the frontend for dashboard, students, teachers, attendance pages.
7. Generate post‑implementation performance audit artifacts.

## User Review Required
[!IMPORTANT]
- Approve addition of the following composite indexes (they will be added to `schema.prisma`):
  - `StudentProfile.tenantId`
  - `StaffProfile.tenantId`
  - `Class.tenantId`
  - `Section.tenantId`
  - `AttendanceSession.tenantId`
  - `Attendance.tenantId`
  - `Invoice` on `(tenantId, status)`
  - `InvoiceItem` on `(tenantId, productId)`
  - `InvoiceItem` on `(tenantId, opportunityLineItemId)`
  - `Expense` on `(tenantId, date)`
  - `Product.tenantId`
  - `PricebookEntry` on `(tenantId, pricebookId)`
  - `Opportunity` on `(tenantId, studentId)`
  - `ExamMark` on `(tenantId, examId)`
- Confirm that adding these indexes does not conflict with any custom sharding or partitioning logic.

## Open Questions
[!WARNING]
- Are there any additional high‑traffic query patterns (e.g., filtering invoices by `opportunityId`) that would benefit from extra indexes?
- Do you prefer SWR (React Hooks) or a custom caching layer for the frontend? The plan uses SWR.

## Proposed Changes
---
### Prisma Schema (`backend/prisma/schema.prisma`)
Add the following `@@index` statements (where not already present):
```prisma
model StudentProfile {
  // existing fields ...
  @@index([tenantId])
}
model StaffProfile {
  // existing fields ...
  @@index([tenantId])
}
model Class {
  // existing fields ...
  @@index([tenantId])
}
model Section {
  // existing fields ...
  @@index([tenantId])
}
model AttendanceSession {
  // existing fields ...
  @@index([tenantId])
}
model Attendance {
  // existing fields ...
  @@index([tenantId])
}
model Invoice {
  // existing fields ...
  @@index([tenantId, status])
}
model InvoiceItem {
  // existing fields ...
  @@index([tenantId, productId])
  @@index([tenantId, opportunityLineItemId])
}
model Expense {
  // existing fields ...
  @@index([tenantId, date])
}
model Product {
  // existing fields ...
  @@index([tenantId])
}
model PricebookEntry {
  // existing fields ...
  @@index([tenantId, pricebookId])
}
model Opportunity {
  // existing fields ...
  @@index([tenantId, studentId])
}
model ExamMark {
  // existing fields ...
  @@index([tenantId, examId])
}
```
These indexes will be added without altering any existing data models.

### Backend Services
#### BillingService (`backend/src/billing/billing.service.ts`)
- Refactor `searchStudents` to fetch opportunities, line items, and invoices in a **single Prisma query** using nested `include`.
- Use `Promise.all` for independent look‑ups (e.g., class name fallback logic).
- Add necessary `select` fields to avoid pulling unnecessary columns.

#### StudentsService (`backend/src/students/students.service.ts`)
- Update `searchStudents`, `getStudentDetails`, `getPromotionCandidates`, and any other data‑heavy methods to include related entities in one query.
- Replace loops that perform per‑record DB calls (e.g., resolving class/section in bulk import) with batch `findMany` + map look‑ups.
- Use `Promise.all` for parallel independent queries such as fetching class lists, section lists, etc.

#### DashboardService (`backend/src/dashboard/dashboard.service.ts`)
- Consolidate all dashboard card queries into **one** Prisma transaction that returns an object with the required aggregates.
- Add indexes on the fields used for aggregation (`tenantId`, dates, status).
- Ensure each card uses the aggregated result instead of separate queries.

#### AttendanceService (`backend/src/attendance/attendance.service.ts`)
- Refactor attendance retrieval to batch fetch related `StudentProfile`, `ClassSection`, and `Period` data.
- Use `Promise.all` for parallel fetching of attendance sessions and related look‑ups.

### Frontend Changes
#### Caching Layer (SWR)
- Install `swr` (via npm) if not present.
- Wrap all dashboard, students, teachers, and attendance API calls with `useSWR` hooks.
- Set `revalidateOnFocus: false`, `dedupingInterval: 60000` to avoid duplicate calls.
- Provide fallback data from cache while background revalidation runs.

#### Remove Duplicate Calls
- Audit each page component (`DashboardPage`, `StudentsPage`, `TeachersPage`, `AttendancePage`) to ensure the data‑fetch hook is invoked only once.
- Extract shared fetch logic into a single utility (`apiClient.ts`) that is reused across pages.

### Performance Audit Artifacts
After changes, scripts will be run to capture:
- `Performance_Audit_Report.md`
- Before/After timing tables per endpoint.
- Query count comparison per endpoint.
- Index usage summary (`EXPLAIN ANALYZE` output snapshots).

## Verification Plan
### Automated Tests
- Run existing unit/integration test suite.
- Add performance benchmark tests using `node --prof` or custom timing wrappers.
### Manual Tests
- Load the Dashboard and verify all cards display instantly (cached) and refresh within <200 ms.
- Navigate between tabs and confirm no loading spinners or zeros appear.
- Use Chrome DevTools Network tab to verify a single request per page.
- Validate that API response times meet the listed targets.
---
