export type Role =
  | "Super Admin"
  | "School Admin"
  | "Teacher"
  | "Student"
  | "Parent"
  | "Admissions Officer"
  | "Exam Admin"
  | "Finance Officer";

export const ROLES: Role[] = [
  "Super Admin",
  "School Admin",
  "Teacher",
  "Student",
  "Parent",
  "Admissions Officer",
  "Exam Admin",
  "Finance Officer",
];

/** Which sidebar sections each role can reach. */
export const ROLE_SECTIONS: Record<Role, string[]> = {
  "Super Admin": [
    "Core",
    "Accounts & Roles",
    "Academics",
    "Students",
    "Attendance",
    "Examinations",
    "Finance",
    "Reports",
  ],
  "School Admin": [
    "Core",
    "Accounts & Roles",
    "Academics",
    "Students",
    "Attendance",
    "Examinations",
    "Finance",
    "Reports",
  ],
  Teacher: ["Academics", "Students", "Attendance", "Examinations"],
  Student: ["Me"],
  Parent: ["Me"],
  "Admissions Officer": ["Students", "Academics", "Reports"],
  "Exam Admin": ["Examinations", "Academics", "Reports"],
  "Finance Officer": ["Finance", "Students", "Reports"],
};

export const canWrite = (role: Role) =>
  ["Super Admin", "School Admin", "Admissions Officer", "Exam Admin", "Finance Officer"].includes(
    role,
  );

/* ------------------------------- KPIs -------------------------------- */

export const dashboardKpis = [
  { label: "Total Students", value: "4,812", delta: "+3.2%", trend: "up", hint: "vs last term" },
  { label: "Attendance Today", value: "94.6%", delta: "+1.1%", trend: "up", hint: "2,341 marked" },
  { label: "Fees Collected", value: "KES 38.4M", delta: "+8.7%", trend: "up", hint: "Term 2" },
  { label: "Outstanding Balance", value: "KES 6.1M", delta: "-2.4%", trend: "down", hint: "412 accounts" },
] as const;

export const revenueSeries = [
  { month: "Jan", collected: 4.2, invoiced: 5.1 },
  { month: "Feb", collected: 5.6, invoiced: 6.0 },
  { month: "Mar", collected: 6.1, invoiced: 6.4 },
  { month: "Apr", collected: 5.2, invoiced: 6.8 },
  { month: "May", collected: 7.4, invoiced: 7.9 },
  { month: "Jun", collected: 8.1, invoiced: 8.4 },
  { month: "Jul", collected: 7.6, invoiced: 8.9 },
];

export const attendanceSeries = [
  { day: "Mon", rate: 96 },
  { day: "Tue", rate: 94 },
  { day: "Wed", rate: 95 },
  { day: "Thu", rate: 92 },
  { day: "Fri", rate: 89 },
  { day: "Sat", rate: 97 },
];

export const classPerformance = [
  { name: "Form 1", mean: 68 },
  { name: "Form 2", mean: 72 },
  { name: "Form 3", mean: 65 },
  { name: "Form 4", mean: 74 },
];

export const enrollmentMix = [
  { name: "Active", value: 4210 },
  { name: "Applicants", value: 318 },
  { name: "Graduated", value: 190 },
  { name: "Transferred", value: 94 },
];

export const activityFeed = [
  { actor: "Grace Njeri", action: "posted Term 2 marks for Form 3 East", module: "Examinations", at: "8 min ago" },
  { actor: "Finance Bot", action: "reconciled 42 M-Pesa payments", module: "Finance", at: "26 min ago" },
  { actor: "Peter Otieno", action: "closed attendance session for Form 1 West", module: "Attendance", at: "1 hr ago" },
  { actor: "Admissions", action: "admitted 12 new applicants", module: "Students", at: "3 hrs ago" },
  { actor: "System", action: "activated academic year 2026", module: "Core", at: "Yesterday" },
];

export const auditLogs = [
  { id: "AL-9021", actor: "amina.hassan@scholaris.io", action: "role.permission.update", target: "Role: Exam Admin", ip: "102.68.11.4", at: "2026-08-16 09:41", severity: "warning" },
  { id: "AL-9020", actor: "system", action: "academic_year.activate", target: "AY 2026", ip: "internal", at: "2026-08-16 08:02", severity: "info" },
  { id: "AL-9019", actor: "j.mwangi@scholaris.io", action: "invoice.void", target: "INV-20416", ip: "41.90.7.221", at: "2026-08-15 17:20", severity: "critical" },
  { id: "AL-9018", actor: "g.njeri@scholaris.io", action: "marks.publish", target: "Form 3 East / Maths", ip: "102.68.11.9", at: "2026-08-15 15:04", severity: "info" },
  { id: "AL-9017", actor: "p.otieno@scholaris.io", action: "auth.login", target: "Session #4412", ip: "196.201.9.14", at: "2026-08-15 07:58", severity: "info" },
];

/* ------------------------------ Accounts ----------------------------- */

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  school: string;
  status: "active" | "invited" | "suspended";
  lastLogin: string;
};

export const users: UserRow[] = [
  { id: "USR-1001", name: "Amina Hassan", email: "amina.hassan@scholaris.io", role: "Super Admin", school: "All schools", status: "active", lastLogin: "2026-08-16 09:12" },
  { id: "USR-1002", name: "James Mwangi", email: "j.mwangi@scholaris.io", role: "School Admin", school: "Riverside Academy", status: "active", lastLogin: "2026-08-16 07:45" },
  { id: "USR-1003", name: "Grace Njeri", email: "g.njeri@scholaris.io", role: "Teacher", school: "Riverside Academy", status: "active", lastLogin: "2026-08-15 16:30" },
  { id: "USR-1004", name: "Peter Otieno", email: "p.otieno@scholaris.io", role: "Teacher", school: "Hillcrest High", status: "active", lastLogin: "2026-08-15 07:58" },
  { id: "USR-1005", name: "Fatuma Ali", email: "f.ali@scholaris.io", role: "Finance Officer", school: "Riverside Academy", status: "active", lastLogin: "2026-08-14 11:02" },
  { id: "USR-1006", name: "Brian Kimani", email: "b.kimani@scholaris.io", role: "Exam Admin", school: "Hillcrest High", status: "invited", lastLogin: "—" },
  { id: "USR-1007", name: "Cynthia Wafula", email: "c.wafula@scholaris.io", role: "Admissions Officer", school: "Lakeview Junior", status: "active", lastLogin: "2026-08-13 09:20" },
  { id: "USR-1008", name: "Daniel Kariuki", email: "d.kariuki@scholaris.io", role: "Parent", school: "Riverside Academy", status: "suspended", lastLogin: "2026-06-01 12:44" },
  { id: "USR-1009", name: "Mercy Chebet", email: "m.chebet@scholaris.io", role: "Student", school: "Hillcrest High", status: "active", lastLogin: "2026-08-16 06:31" },
  { id: "USR-1010", name: "Otieno Ochieng", email: "o.ochieng@scholaris.io", role: "School Admin", school: "Lakeview Junior", status: "active", lastLogin: "2026-08-12 18:10" },
];

export const roleRows = [
  { id: "ROL-01", name: "Super Admin", scope: "Platform", members: 3, permissions: 48, status: "system" },
  { id: "ROL-02", name: "School Admin", scope: "School", members: 12, permissions: 36, status: "active" },
  { id: "ROL-03", name: "Teacher", scope: "School", members: 148, permissions: 14, status: "active" },
  { id: "ROL-04", name: "Admissions Officer", scope: "School", members: 9, permissions: 11, status: "active" },
  { id: "ROL-05", name: "Exam Admin", scope: "School", members: 6, permissions: 13, status: "active" },
  { id: "ROL-06", name: "Finance Officer", scope: "School", members: 8, permissions: 15, status: "active" },
  { id: "ROL-07", name: "Parent", scope: "Portal", members: 3120, permissions: 5, status: "active" },
  { id: "ROL-08", name: "Student", scope: "Portal", members: 4210, permissions: 4, status: "draft" },
];

export const permissionGroups = [
  { module: "Accounts", items: ["users.view", "users.create", "users.update", "users.suspend", "roles.manage", "permissions.manage"] },
  { module: "Academics", items: ["academic_year.manage", "terms.manage", "classes.manage", "streams.manage", "subjects.manage", "assignments.manage"] },
  { module: "Students", items: ["students.view", "students.create", "students.update", "guardians.manage", "enrollments.manage", "documents.upload"] },
  { module: "Attendance", items: ["sessions.open", "sessions.close", "records.mark", "records.bulk", "reports.view"] },
  { module: "Examinations", items: ["exams.manage", "grade_scales.manage", "marks.enter", "results.publish", "rankings.view"] },
  { module: "Finance", items: ["fees.manage", "invoices.issue", "payments.record", "receipts.issue", "accounts.view", "discounts.manage"] },
];

/* -------------------------------- Core ------------------------------- */

export const schools = [
  { id: "SCH-001", name: "Riverside Academy", code: "RVA", type: "Secondary", town: "Nairobi", students: 1820, staff: 96, status: "active" },
  { id: "SCH-002", name: "Hillcrest High", code: "HCH", type: "Secondary", town: "Nakuru", students: 1412, staff: 78, status: "active" },
  { id: "SCH-003", name: "Lakeview Junior", code: "LVJ", type: "Primary", town: "Kisumu", students: 980, staff: 52, status: "active" },
  { id: "SCH-004", name: "Summit Boys", code: "SMB", type: "Secondary", town: "Eldoret", students: 600, staff: 34, status: "onboarding" },
];

/* ------------------------------ Academics ---------------------------- */

export const academicYears = [
  { id: "AY-2026", year: "2026", starts: "2026-01-06", ends: "2026-11-27", terms: 3, status: "active" },
  { id: "AY-2025", year: "2025", starts: "2025-01-07", ends: "2025-11-28", terms: 3, status: "closed" },
  { id: "AY-2024", year: "2024", starts: "2024-01-08", ends: "2024-11-29", terms: 3, status: "closed" },
];

export const terms = [
  { id: "TRM-261", name: "Term 1", year: "2026", starts: "2026-01-06", ends: "2026-04-03", weeks: 13, status: "closed" },
  { id: "TRM-262", name: "Term 2", year: "2026", starts: "2026-05-04", ends: "2026-08-07", weeks: 14, status: "active" },
  { id: "TRM-263", name: "Term 3", year: "2026", starts: "2026-09-01", ends: "2026-11-27", weeks: 12, status: "draft" },
];

export const classes = [
  { id: "CLS-01", name: "Form 1", group: "Lower Secondary", streams: 3, students: 412, teacher: "Grace Njeri", status: "active" },
  { id: "CLS-02", name: "Form 2", group: "Lower Secondary", streams: 3, students: 398, teacher: "Peter Otieno", status: "active" },
  { id: "CLS-03", name: "Form 3", group: "Upper Secondary", streams: 4, students: 441, teacher: "Brian Kimani", status: "active" },
  { id: "CLS-04", name: "Form 4", group: "Upper Secondary", streams: 4, students: 386, teacher: "Cynthia Wafula", status: "active" },
];

export const streams = [
  { id: "STR-01", name: "Form 1 East", class: "Form 1", capacity: 45, enrolled: 43, room: "B12", tutor: "Grace Njeri", status: "active" },
  { id: "STR-02", name: "Form 1 West", class: "Form 1", capacity: 45, enrolled: 45, room: "B14", tutor: "Peter Otieno", status: "full" },
  { id: "STR-03", name: "Form 2 East", class: "Form 2", capacity: 45, enrolled: 40, room: "C02", tutor: "Fatuma Ali", status: "active" },
  { id: "STR-04", name: "Form 3 East", class: "Form 3", capacity: 48, enrolled: 47, room: "C11", tutor: "Brian Kimani", status: "active" },
  { id: "STR-05", name: "Form 4 North", class: "Form 4", capacity: 48, enrolled: 44, room: "D01", tutor: "Cynthia Wafula", status: "active" },
];

export const subjects = [
  { id: "SUB-01", code: "MAT", name: "Mathematics", department: "Sciences", type: "Core", teachers: 9, status: "active" },
  { id: "SUB-02", code: "ENG", name: "English", department: "Languages", type: "Core", teachers: 7, status: "active" },
  { id: "SUB-03", code: "KIS", name: "Kiswahili", department: "Languages", type: "Core", teachers: 6, status: "active" },
  { id: "SUB-04", code: "BIO", name: "Biology", department: "Sciences", type: "Elective", teachers: 5, status: "active" },
  { id: "SUB-05", code: "CHE", name: "Chemistry", department: "Sciences", type: "Elective", teachers: 5, status: "active" },
  { id: "SUB-06", code: "HIS", name: "History", department: "Humanities", type: "Elective", teachers: 4, status: "active" },
  { id: "SUB-07", code: "CSC", name: "Computer Studies", department: "Technicals", type: "Elective", teachers: 3, status: "draft" },
];

export const subjectAssignments = [
  { id: "ASG-01", subject: "Mathematics", class: "Form 3", stream: "Form 3 East", teacher: "Brian Kimani", lessons: 6, status: "active" },
  { id: "ASG-02", subject: "English", class: "Form 1", stream: "Form 1 East", teacher: "Grace Njeri", lessons: 5, status: "active" },
  { id: "ASG-03", subject: "Biology", class: "Form 4", stream: "Form 4 North", teacher: "Peter Otieno", lessons: 4, status: "active" },
  { id: "ASG-04", subject: "Kiswahili", class: "Form 2", stream: "Form 2 East", teacher: "Fatuma Ali", lessons: 5, status: "pending" },
];

/* ------------------------------ Students ----------------------------- */

export type StudentRow = {
  id: string;
  adm: string;
  name: string;
  class: string;
  stream: string;
  guardian: string;
  status: "applicant" | "active" | "transferred" | "graduated" | "withdrawn";
  balance: string;
};

export const students: StudentRow[] = [
  { id: "STD-4001", adm: "RVA/2026/001", name: "Mercy Chebet", class: "Form 3", stream: "Form 3 East", guardian: "Daniel Kariuki", status: "active", balance: "KES 0" },
  { id: "STD-4002", adm: "RVA/2026/002", name: "Kevin Mutua", class: "Form 1", stream: "Form 1 West", guardian: "Jane Mutua", status: "active", balance: "KES 12,500" },
  { id: "STD-4003", adm: "RVA/2026/003", name: "Aisha Noor", class: "Form 2", stream: "Form 2 East", guardian: "Noor Abdi", status: "active", balance: "KES 4,200" },
  { id: "STD-4004", adm: "APP/2026/188", name: "Samuel Kiptoo", class: "Form 1", stream: "—", guardian: "Ruth Kiptoo", status: "applicant", balance: "—" },
  { id: "STD-4005", adm: "HCH/2025/771", name: "Linet Achieng", class: "Form 4", stream: "Form 4 North", guardian: "Paul Achieng", status: "active", balance: "KES 28,900" },
  { id: "STD-4006", adm: "HCH/2022/104", name: "Victor Barasa", class: "Form 4", stream: "Form 4 North", guardian: "Alice Barasa", status: "graduated", balance: "KES 0" },
  { id: "STD-4007", adm: "LVJ/2024/512", name: "Nadia Wanjiru", class: "Form 2", stream: "Form 2 East", guardian: "Simon Wanjiru", status: "transferred", balance: "KES 1,000" },
  { id: "STD-4008", adm: "RVA/2023/318", name: "Elijah Rono", class: "Form 3", stream: "Form 3 East", guardian: "Mary Rono", status: "withdrawn", balance: "KES 9,400" },
  { id: "STD-4009", adm: "RVA/2026/009", name: "Halima Yusuf", class: "Form 1", stream: "Form 1 East", guardian: "Yusuf Omar", status: "active", balance: "KES 0" },
  { id: "STD-4010", adm: "RVA/2026/010", name: "Collins Barasa", class: "Form 3", stream: "Form 3 East", guardian: "Alice Barasa", status: "active", balance: "KES 7,600" },
  { id: "STD-4011", adm: "APP/2026/191", name: "Tabitha Njoki", class: "Form 1", stream: "—", guardian: "Grace Njoki", status: "applicant", balance: "—" },
  { id: "STD-4012", adm: "HCH/2026/044", name: "Ryan Omondi", class: "Form 2", stream: "Form 2 East", guardian: "Beatrice Omondi", status: "active", balance: "KES 3,300" },
];

export const guardians = [
  { id: "GRD-201", name: "Daniel Kariuki", relation: "Father", phone: "+254 712 445 001", email: "d.kariuki@mail.com", students: 2, portal: "active" },
  { id: "GRD-202", name: "Jane Mutua", relation: "Mother", phone: "+254 720 118 442", email: "jane.mutua@mail.com", students: 1, portal: "active" },
  { id: "GRD-203", name: "Noor Abdi", relation: "Father", phone: "+254 733 900 210", email: "noor.abdi@mail.com", students: 3, portal: "invited" },
  { id: "GRD-204", name: "Alice Barasa", relation: "Guardian", phone: "+254 701 552 776", email: "alice.b@mail.com", students: 2, portal: "active" },
  { id: "GRD-205", name: "Ruth Kiptoo", relation: "Mother", phone: "+254 799 331 908", email: "ruth.k@mail.com", students: 1, portal: "pending" },
];

export const enrollments = [
  { id: "ENR-8801", student: "Mercy Chebet", year: "2026", class: "Form 3", stream: "Form 3 East", date: "2026-01-06", status: "active" },
  { id: "ENR-8802", student: "Kevin Mutua", year: "2026", class: "Form 1", stream: "Form 1 West", date: "2026-01-06", status: "active" },
  { id: "ENR-8803", student: "Samuel Kiptoo", year: "2026", class: "Form 1", stream: "—", date: "2026-08-02", status: "pending" },
  { id: "ENR-8804", student: "Nadia Wanjiru", year: "2025", class: "Form 2", stream: "Form 2 East", date: "2025-01-07", status: "transferred" },
];

export const studentDocuments = [
  { id: "DOC-01", student: "Mercy Chebet", type: "Birth certificate", file: "chebet-birth-cert.pdf", size: "412 KB", uploaded: "2026-01-06", status: "verified" },
  { id: "DOC-02", student: "Kevin Mutua", type: "KCPE result slip", file: "mutua-kcpe.pdf", size: "228 KB", uploaded: "2026-01-08", status: "verified" },
  { id: "DOC-03", student: "Samuel Kiptoo", type: "Transfer letter", file: "kiptoo-transfer.pdf", size: "180 KB", uploaded: "2026-08-02", status: "pending" },
];

/* ----------------------------- Attendance ---------------------------- */

export const attendanceSessions = [
  { id: "SES-3301", date: "2026-08-16", class: "Form 1", stream: "Form 1 East", period: "Morning", marked: 43, expected: 43, status: "closed" },
  { id: "SES-3302", date: "2026-08-16", class: "Form 1", stream: "Form 1 West", period: "Morning", marked: 41, expected: 45, status: "open" },
  { id: "SES-3303", date: "2026-08-16", class: "Form 3", stream: "Form 3 East", period: "Morning", marked: 0, expected: 47, status: "open" },
  { id: "SES-3304", date: "2026-08-15", class: "Form 4", stream: "Form 4 North", period: "Afternoon", marked: 44, expected: 44, status: "closed" },
];

export const attendanceRecords = [
  { id: "STD-4001", adm: "RVA/2026/001", name: "Mercy Chebet", status: "present", note: "" },
  { id: "STD-4010", adm: "RVA/2026/010", name: "Collins Barasa", status: "late", note: "Bus delay" },
  { id: "STD-4008", adm: "RVA/2023/318", name: "Elijah Rono", status: "absent", note: "Unexplained" },
  { id: "STD-4003", adm: "RVA/2026/003", name: "Aisha Noor", status: "excused", note: "Medical" },
  { id: "STD-4009", adm: "RVA/2026/009", name: "Halima Yusuf", status: "present", note: "" },
];

export const attendanceSummaries = [
  { id: "SUM-01", class: "Form 1", stream: "Form 1 East", term: "Term 2", present: 96.4, late: 1.8, absent: 1.8, sessions: 62 },
  { id: "SUM-02", class: "Form 1", stream: "Form 1 West", term: "Term 2", present: 92.1, late: 3.4, absent: 4.5, sessions: 62 },
  { id: "SUM-03", class: "Form 3", stream: "Form 3 East", term: "Term 2", present: 94.8, late: 2.1, absent: 3.1, sessions: 60 },
  { id: "SUM-04", class: "Form 4", stream: "Form 4 North", term: "Term 2", present: 97.2, late: 1.0, absent: 1.8, sessions: 61 },
];

/* ---------------------------- Examinations --------------------------- */

export const examTypes = [
  { id: "EXT-01", name: "Opener Exam", weight: "15%", scope: "Term", grading: "KCSE 12-point", status: "active" },
  { id: "EXT-02", name: "Mid-Term Exam", weight: "25%", scope: "Term", grading: "KCSE 12-point", status: "active" },
  { id: "EXT-03", name: "End-Term Exam", weight: "60%", scope: "Term", grading: "KCSE 12-point", status: "active" },
  { id: "EXT-04", name: "Mock Exam", weight: "100%", scope: "Year", grading: "KCSE 12-point", status: "draft" },
];

export const exams = [
  { id: "EXM-7701", name: "Term 2 End-Term", type: "End-Term Exam", class: "Form 3", starts: "2026-07-28", ends: "2026-08-06", subjects: 9, status: "marking" },
  { id: "EXM-7702", name: "Term 2 End-Term", type: "End-Term Exam", class: "Form 4", starts: "2026-07-28", ends: "2026-08-06", subjects: 10, status: "published" },
  { id: "EXM-7703", name: "Term 3 Opener", type: "Opener Exam", class: "Form 1", starts: "2026-09-08", ends: "2026-09-12", subjects: 8, status: "scheduled" },
  { id: "EXM-7704", name: "Mock 2026", type: "Mock Exam", class: "Form 4", starts: "2026-09-22", ends: "2026-10-03", subjects: 10, status: "draft" },
];

export const gradeScales = [
  { id: "GRD-A", grade: "A", from: 80, to: 100, points: 12, remark: "Excellent" },
  { id: "GRD-B", grade: "B", from: 65, to: 79, points: 9, remark: "Very good" },
  { id: "GRD-C", grade: "C", from: 50, to: 64, points: 6, remark: "Good" },
  { id: "GRD-D", grade: "D", from: 35, to: 49, points: 3, remark: "Needs support" },
  { id: "GRD-E", grade: "E", from: 0, to: 34, points: 1, remark: "At risk" },
];

export const marksEntry = [
  { id: "STD-4001", adm: "RVA/2026/001", name: "Mercy Chebet", score: 88, grade: "A", status: "saved" },
  { id: "STD-4010", adm: "RVA/2026/010", name: "Collins Barasa", score: 71, grade: "B", status: "saved" },
  { id: "STD-4008", adm: "RVA/2023/318", name: "Elijah Rono", score: 54, grade: "C", status: "draft" },
  { id: "STD-4003", adm: "RVA/2026/003", name: "Aisha Noor", score: 79, grade: "B", status: "saved" },
  { id: "STD-4009", adm: "RVA/2026/009", name: "Halima Yusuf", score: 46, grade: "D", status: "draft" },
];

export const rankings = [
  { pos: 1, name: "Mercy Chebet", class: "Form 3", stream: "Form 3 East", total: 792, mean: 88.0, grade: "A", change: "+2" },
  { pos: 2, name: "Halima Yusuf", class: "Form 1", stream: "Form 1 East", total: 741, mean: 82.3, grade: "A", change: "0" },
  { pos: 3, name: "Collins Barasa", class: "Form 3", stream: "Form 3 East", total: 703, mean: 78.1, grade: "B", change: "-1" },
  { pos: 4, name: "Aisha Noor", class: "Form 2", stream: "Form 2 East", total: 688, mean: 76.4, grade: "B", change: "+4" },
  { pos: 5, name: "Ryan Omondi", class: "Form 2", stream: "Form 2 East", total: 651, mean: 72.3, grade: "B", change: "-2" },
];

export const subjectPerformance = [
  { subject: "Maths", mean: 64 },
  { subject: "English", mean: 71 },
  { subject: "Kiswahili", mean: 69 },
  { subject: "Biology", mean: 66 },
  { subject: "Chemistry", mean: 58 },
  { subject: "History", mean: 74 },
];

/* ------------------------------- Finance ----------------------------- */

export const feeCategories = [
  { id: "FEC-01", name: "Tuition", cadence: "Termly", mandatory: "Yes", accounts: 4812, amount: "KES 24,000", status: "active" },
  { id: "FEC-02", name: "Boarding", cadence: "Termly", mandatory: "No", accounts: 1902, amount: "KES 18,500", status: "active" },
  { id: "FEC-03", name: "Transport", cadence: "Termly", mandatory: "No", accounts: 812, amount: "KES 9,000", status: "active" },
  { id: "FEC-04", name: "Activity", cadence: "Yearly", mandatory: "Yes", accounts: 4812, amount: "KES 3,500", status: "active" },
  { id: "FEC-05", name: "Lab & ICT", cadence: "Termly", mandatory: "No", accounts: 1244, amount: "KES 2,800", status: "draft" },
];

export const feeStructures = [
  { id: "FST-01", name: "Form 1 Boarder 2026", class: "Form 1", year: "2026", items: 5, total: "KES 58,000", status: "active" },
  { id: "FST-02", name: "Form 1 Day 2026", class: "Form 1", year: "2026", items: 3, total: "KES 32,000", status: "active" },
  { id: "FST-03", name: "Form 4 Boarder 2026", class: "Form 4", year: "2026", items: 6, total: "KES 64,500", status: "active" },
  { id: "FST-04", name: "Form 3 Day 2027", class: "Form 3", year: "2027", items: 3, total: "KES 34,500", status: "draft" },
];

export const invoices = [
  { id: "INV-20418", student: "Mercy Chebet", class: "Form 3", term: "Term 2", issued: "2026-05-04", due: "2026-05-25", amount: "KES 58,000", balance: "KES 0", status: "paid" },
  { id: "INV-20419", student: "Kevin Mutua", class: "Form 1", term: "Term 2", issued: "2026-05-04", due: "2026-05-25", amount: "KES 32,000", balance: "KES 12,500", status: "partial" },
  { id: "INV-20420", student: "Linet Achieng", class: "Form 4", term: "Term 2", issued: "2026-05-04", due: "2026-05-25", amount: "KES 64,500", balance: "KES 28,900", status: "overdue" },
  { id: "INV-20421", student: "Aisha Noor", class: "Form 2", term: "Term 2", issued: "2026-05-04", due: "2026-05-25", amount: "KES 34,500", balance: "KES 4,200", status: "partial" },
  { id: "INV-20422", student: "Halima Yusuf", class: "Form 1", term: "Term 2", issued: "2026-05-04", due: "2026-05-25", amount: "KES 32,000", balance: "KES 0", status: "paid" },
  { id: "INV-20423", student: "Tabitha Njoki", class: "Form 1", term: "Term 3", issued: "2026-08-10", due: "2026-09-05", amount: "KES 32,000", balance: "KES 32,000", status: "draft" },
];

export const payments = [
  { id: "PMT-55101", receipt: "RCP-9001", student: "Mercy Chebet", method: "M-Pesa", ref: "SJ72KD91X", amount: "KES 58,000", date: "2026-05-12", status: "cleared" },
  { id: "PMT-55102", receipt: "RCP-9002", student: "Kevin Mutua", method: "Bank transfer", ref: "EQ-40182", amount: "KES 19,500", date: "2026-05-18", status: "cleared" },
  { id: "PMT-55103", receipt: "RCP-9003", student: "Aisha Noor", method: "M-Pesa", ref: "SJ88LM02Q", amount: "KES 30,300", date: "2026-06-02", status: "cleared" },
  { id: "PMT-55104", receipt: "—", student: "Linet Achieng", method: "Cheque", ref: "CHQ-1188", amount: "KES 35,600", date: "2026-06-20", status: "pending" },
  { id: "PMT-55105", receipt: "—", student: "Ryan Omondi", method: "M-Pesa", ref: "SJ91PP44R", amount: "KES 3,300", date: "2026-08-14", status: "failed" },
];

export const studentAccounts = [
  { id: "ACC-4001", student: "Mercy Chebet", class: "Form 3", invoiced: "KES 174,000", paid: "KES 174,000", balance: "KES 0", plan: "Full term", status: "cleared" },
  { id: "ACC-4002", student: "Kevin Mutua", class: "Form 1", invoiced: "KES 96,000", paid: "KES 83,500", balance: "KES 12,500", plan: "Monthly", status: "in arrears" },
  { id: "ACC-4005", student: "Linet Achieng", class: "Form 4", invoiced: "KES 193,500", paid: "KES 164,600", balance: "KES 28,900", plan: "Installments", status: "overdue" },
  { id: "ACC-4003", student: "Aisha Noor", class: "Form 2", invoiced: "KES 103,500", paid: "KES 99,300", balance: "KES 4,200", plan: "Scholarship 30%", status: "in arrears" },
];

export const discounts = [
  { id: "DSC-01", name: "Academic scholarship", type: "Percentage", value: "30%", beneficiaries: 84, sponsor: "Board of Governors", status: "active" },
  { id: "DSC-02", name: "Sibling discount", type: "Percentage", value: "10%", beneficiaries: 212, sponsor: "School", status: "active" },
  { id: "DSC-03", name: "Bursary — county", type: "Fixed", value: "KES 15,000", beneficiaries: 46, sponsor: "County Government", status: "active" },
  { id: "DSC-04", name: "Staff child waiver", type: "Percentage", value: "50%", beneficiaries: 18, sponsor: "School", status: "draft" },
];

export const collectionsByClass = [
  { name: "Form 1", collected: 8.9, due: 1.6 },
  { name: "Form 2", collected: 9.4, due: 1.1 },
  { name: "Form 3", collected: 10.2, due: 1.8 },
  { name: "Form 4", collected: 9.9, due: 1.6 },
];

/* --------------------------- Personal views -------------------------- */

export const myGrades = [
  { subject: "Mathematics", opener: 74, mid: 81, end: 88, grade: "A", teacher: "Brian Kimani" },
  { subject: "English", opener: 68, mid: 72, end: 79, grade: "B", teacher: "Grace Njeri" },
  { subject: "Kiswahili", opener: 70, mid: 69, end: 75, grade: "B", teacher: "Fatuma Ali" },
  { subject: "Biology", opener: 62, mid: 71, end: 77, grade: "B", teacher: "Peter Otieno" },
  { subject: "Chemistry", opener: 58, mid: 64, end: 69, grade: "B", teacher: "Peter Otieno" },
];

export const myPayments = [
  { id: "RCP-9001", term: "Term 2", method: "M-Pesa", amount: "KES 58,000", date: "2026-05-12", status: "cleared" },
  { id: "RCP-8890", term: "Term 1", method: "Bank transfer", amount: "KES 58,000", date: "2026-01-14", status: "cleared" },
  { id: "RCP-8712", term: "Term 3 (2025)", method: "M-Pesa", amount: "KES 54,000", date: "2025-09-09", status: "cleared" },
];

export const myTimetable = [
  { day: "Monday", slots: ["Maths — 8:00", "English — 10:00", "Biology — 14:00"] },
  { day: "Tuesday", slots: ["Chemistry — 8:00", "Kiswahili — 11:00"] },
  { day: "Wednesday", slots: ["Maths — 8:00", "History — 12:00"] },
  { day: "Thursday", slots: ["Biology — 9:00", "English — 11:00"] },
  { day: "Friday", slots: ["Maths — 8:00", "Games — 15:00"] },
];
