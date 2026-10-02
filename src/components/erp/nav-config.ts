import {
  Banknote,
  BookOpen,
  CalendarCheck,
  CalendarRange,
  ClipboardCheck,
  ClipboardList,
  FileBarChart,
  FileText,
  FolderOpen,
  GraduationCap,
  Layers,
  LayoutDashboard,
  ListChecks,
  Percent,
  Receipt,
  ScrollText,
  Settings2,
  ShieldCheck,
  Trophy,
  Users,
  UserSquare2,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import type { Area } from "./role-context";

/**
 * `area`: shown when the user can read that area of the API (see role-context).
 * `audience`: "staff" (default), "portal" (parents/students only) or "everyone".
 */
export type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  area?: Area;
  audience?: "staff" | "portal" | "everyone";
};
export type NavSection = { section: string; items: NavItem[] };

export const NAV: NavSection[] = [
  {
    section: "Overview",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard, audience: "staff" },
      { title: "My portal", url: "/me", icon: UserSquare2, audience: "portal" },
      { title: "My profile", url: "/accounts/profile", icon: UserSquare2, audience: "everyone" },
    ],
  },
  {
    section: "Core",
    items: [
      { title: "Schools", url: "/core/schools", icon: Settings2, area: "audit_logs" },
      { title: "Audit logs", url: "/core/audit-logs", icon: ScrollText, area: "audit_logs" },
    ],
  },
  {
    section: "Accounts & Roles",
    items: [
      { title: "Users", url: "/accounts/users", icon: Users, area: "users" },
      { title: "Roles", url: "/accounts/roles", icon: ShieldCheck, area: "roles" },
      { title: "Permissions", url: "/accounts/permissions", icon: ListChecks, area: "roles" },
    ],
  },
  {
    section: "Academics",
    items: [
      { title: "Academic years", url: "/academics/academic-years", icon: CalendarRange, area: "academics" },
      { title: "Terms", url: "/academics/terms", icon: CalendarCheck, area: "academics" },
      { title: "Classes", url: "/academics/classes", icon: Layers, area: "academics" },
      { title: "Streams", url: "/academics/streams", icon: Layers, area: "academics" },
      { title: "Subjects", url: "/academics/subjects", icon: BookOpen, area: "academics" },
      { title: "Subject assignments", url: "/academics/subject-assignments", icon: ClipboardList, area: "subject_assignments" },
    ],
  },
  {
    section: "Students",
    items: [
      { title: "Directory", url: "/students", icon: GraduationCap, area: "students" },
      { title: "Parents & guardians", url: "/students/parents", icon: Users, area: "guardians" },
      { title: "Enrollments", url: "/students/enrollments", icon: ClipboardCheck, area: "enrollments" },
      { title: "Documents", url: "/students/documents", icon: FolderOpen, area: "documents" },
    ],
  },
  {
    section: "Attendance",
    items: [
      { title: "Sessions", url: "/attendance/sessions", icon: CalendarCheck, area: "attendance" },
      { title: "Mark attendance", url: "/attendance/mark", icon: ClipboardCheck, area: "attendance" },
      { title: "Reports", url: "/attendance/reports", icon: FileBarChart, area: "attendance_summaries" },
    ],
  },
  {
    section: "Examinations",
    items: [
      { title: "Exams & schedules", url: "/examinations/exams", icon: FileText, area: "exams" },
      { title: "Grade scales", url: "/examinations/grade-scales", icon: Percent, area: "exams" },
      { title: "Marks entry", url: "/examinations/marks", icon: ClipboardList, area: "marks" },
      { title: "Results & rankings", url: "/examinations/results", icon: Trophy, area: "results" },
    ],
  },
  {
    section: "Finance",
    items: [
      { title: "Fees setup", url: "/finance/fees", icon: Wallet, area: "finance" },
      { title: "Invoices", url: "/finance/invoices", icon: Receipt, area: "finance_ledger" },
      { title: "Payments", url: "/finance/payments", icon: Banknote, area: "finance_ledger" },
      { title: "Student accounts", url: "/finance/accounts", icon: FileBarChart, area: "finance_ledger" },
    ],
  },
  {
    section: "Reports",
    items: [{ title: "Reports & audit", url: "/reports", icon: FileBarChart, area: "finance" }],
  },
];
