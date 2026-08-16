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

export type NavItem = { title: string; url: string; icon: LucideIcon };
export type NavSection = { section: string; items: NavItem[] };

export const NAV: NavSection[] = [
  {
    section: "Overview",
    items: [{ title: "Dashboard", url: "/", icon: LayoutDashboard }],
  },
  {
    section: "Core",
    items: [
      { title: "Schools", url: "/core/schools", icon: Settings2 },
      { title: "Audit logs", url: "/core/audit-logs", icon: ScrollText },
    ],
  },
  {
    section: "Accounts & Roles",
    items: [
      { title: "Users", url: "/accounts/users", icon: Users },
      { title: "Roles", url: "/accounts/roles", icon: ShieldCheck },
      { title: "Permissions", url: "/accounts/permissions", icon: ListChecks },
      { title: "Profile", url: "/accounts/profile", icon: UserSquare2 },
    ],
  },
  {
    section: "Academics",
    items: [
      { title: "Academic years", url: "/academics/academic-years", icon: CalendarRange },
      { title: "Terms", url: "/academics/terms", icon: CalendarCheck },
      { title: "Classes", url: "/academics/classes", icon: Layers },
      { title: "Streams", url: "/academics/streams", icon: Layers },
      { title: "Subjects", url: "/academics/subjects", icon: BookOpen },
      { title: "Subject assignments", url: "/academics/subject-assignments", icon: ClipboardList },
    ],
  },
  {
    section: "Students",
    items: [
      { title: "Directory", url: "/students", icon: GraduationCap },
      { title: "Parents & guardians", url: "/students/parents", icon: Users },
      { title: "Enrollments", url: "/students/enrollments", icon: ClipboardCheck },
      { title: "Documents", url: "/students/documents", icon: FolderOpen },
    ],
  },
  {
    section: "Attendance",
    items: [
      { title: "Sessions", url: "/attendance/sessions", icon: CalendarCheck },
      { title: "Mark attendance", url: "/attendance/mark", icon: ClipboardCheck },
      { title: "Reports", url: "/attendance/reports", icon: FileBarChart },
    ],
  },
  {
    section: "Examinations",
    items: [
      { title: "Exams & schedules", url: "/examinations/exams", icon: FileText },
      { title: "Grade scales", url: "/examinations/grade-scales", icon: Percent },
      { title: "Marks entry", url: "/examinations/marks", icon: ClipboardList },
      { title: "Results & rankings", url: "/examinations/results", icon: Trophy },
    ],
  },
  {
    section: "Finance",
    items: [
      { title: "Fees setup", url: "/finance/fees", icon: Wallet },
      { title: "Invoices", url: "/finance/invoices", icon: Receipt },
      { title: "Payments", url: "/finance/payments", icon: Banknote },
      { title: "Student accounts", url: "/finance/accounts", icon: FileBarChart },
    ],
  },
  {
    section: "Reports",
    items: [{ title: "Reports & audit", url: "/reports", icon: FileBarChart }],
  },
  {
    section: "Me",
    items: [{ title: "My portal", url: "/me", icon: UserSquare2 }],
  },
];
