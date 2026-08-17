# School Harmony Hub

Build a modern, premium school management system frontend in React + TypeScript + Tailwind CSS + shadcn/ui.

Project goal:

Create a complete education ERP dashboard for a multi-school admin platform. The design should feel professional, clean, and enterprise-ready, with a strong focus on school administration, student management, academic tracking, attendance, examinations, and finance.

Core app structure:

- Authentication: login, forgot password, reset password

- Dashboard overview with KPI cards, recent activity, performance charts, and quick actions

- Navigation sidebar with sections:

  1. Core

  2. Accounts & Roles

  3. Academics

  4. Students

  5. Attendance

  6. Examinations

  7. Finance

  8. Reports / Audit Logs

Design language:

- Use a professional school brand palette: deep navy, teal, slate, white, soft gold accents

- Clean cards, rounded corners, subtle shadows, crisp typography

- Responsive dashboard layout for desktop and tablet

- Modern admin SaaS feel with strong information hierarchy

- Include empty states, search fields, filter chips, tabs, modal dialogs, and action buttons

- Use soft gradients and simple iconography, but keep it minimal and data-heavy

Required modules and pages:

1. Accounts / Users

- User list with search, filters, status badges, and role tags

- Create/Edit user form

- Role management page

- Permission management page

- Profile page with personal details and password update

- Login activity / audit info area

- API endpoints style: /api/accounts/users, /api/accounts/roles, /api/accounts/permissions, /api/accounts/profile

2. Core / School Settings

- School list and detail page

- Audit log timeline and activity feed

- School configuration cards

- API style: /api/core/schools, /api/core/audit-logs

3. Academics

- Academic year management (current/active year status)

- Terms management

- Classes and class groups

- Streams within classes

- Subjects catalog

- Subject assignment to teachers and classes

- API style: /api/academics/academic-years, /api/academics/terms, /api/academics/classes, /api/academics/streams, /api/academics/subjects, /api/academics/subject-assignments

4. Students

- Student directory with admissions table

- Add/edit student profile

- Parent and guardian management

- Enrollment records

- Student status badges: applicant, active, transferred, graduated, withdrawn

- Student documents upload area

- Relationship-driven data cards

- API style: /api/students/students, /api/students/parents, /api/students/guardians, /api/students/enrollments, /api/students/documents

5. Attendance

- Attendance session calendar

- Open/close session actions

- Mark attendance by class and stream

- Bulk attendance entry

- Attendance summaries and percentage tracking

- Reports for daily, monthly, and term attendance

- API style: /api/attendance/sessions, /api/attendance/records, /api/attendance/summaries, /api/attendance/reports, /api/attendance/bulk

6. Examinations

- Exam types and exam schedules

- Grade scales

- Marks entry and result management

- Rankings and performance tables

- Score summaries by student/class

- API style: /api/examinations/exam-types, /api/examinations/exams, /api/examinations/grade-scales, /api/examinations/marks, /api/examinations/results, /api/examinations/rankings

7. Finance

- Fee categories and fee structures

- Student invoices and invoice items

- Payment tracking

- Receipts and student account balances

- Discounts, scholarships, and payment plans

- Analytics on due balances and collections

- API style: /api/finance/fee-categories, /api/finance/fee-structures, /api/finance/invoices, /api/finance/payments, /api/finance/receipts, /api/finance/accounts

UI components to include:

- Sidebar navigation

- Top header with search, notifications, account menu

- KPI summary cards

- Data tables with actions

- Sort/search/filter controls

- Drawer/modal forms

- Tabs and segmented controls

- Status badges (active, draft, paid, overdue, etc.)

- Charts for revenue, attendance, class performance, and school overview

- Date pickers, dropdowns, file upload fields, and confirmation modals

User roles to reflect in UI:

- Super Admin

- School Admin

- Teacher

- Student

- Parent

- Admissions Officer

- Exam Admin

- Finance Officer

Navigation behavior:

- Show role-based sections and actions

- Hide less relevant controls for non-admin roles

- Student/parent views should show personal profile, grades, attendance, and payment history

- Teacher view should show class assignments, attendance marking, marks entry, and schedules

Data handling:

- Use realistic mock data and fallback empty states

- Support table filtering, sorting, and pagination

- Use loading skeletons for data tables and forms

- Important actions should have confirmation dialogs

- Add consistent field validation and polished form states

Deliverable:

Build a complete, production-style front-end interface for this school management app, with the above sections and realistic admin flows, using a clean SaaS dashboard aesthetic. Keep the interface highly usable and visually polished, and ensure it feels like a real school ERP product rather than a generic CRUD app.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://schoolharmonyhubv1.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2260892a-834c-44bc-b0ee-f20cdb3efb6f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
