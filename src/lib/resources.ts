import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, listAll } from "./api";
import { useAuth } from "./auth";
import type { Field, Option } from "@/components/erp/forms";
import { useRole, type Area } from "@/components/erp/role-context";

/** Every backend list endpoint the UI reads, keyed by a short name. */
export const ENDPOINTS = {
  schools: "/api/core/schools/",
  auditLogs: "/api/core/audit-logs/",
  users: "/api/accounts/users/",
  roles: "/api/accounts/roles/",
  permissions: "/api/accounts/permissions/",
  academicYears: "/api/academics/academic-years/",
  terms: "/api/academics/terms/",
  classes: "/api/academics/classes/",
  streams: "/api/academics/streams/",
  subjects: "/api/academics/subjects/",
  subjectAssignments: "/api/academics/subject-assignments/",
  students: "/api/students/",
  parents: "/api/students/parents/",
  guardians: "/api/students/guardians/",
  enrollments: "/api/students/enrollments/",
  documents: "/api/students/documents/",
  attendanceSessions: "/api/attendance/sessions/",
  attendanceRecords: "/api/attendance/records/",
  attendanceSummaries: "/api/attendance/summaries/",
  examTypes: "/api/examinations/exam-types/",
  exams: "/api/examinations/exams/",
  gradeScales: "/api/examinations/grade-scales/",
  marks: "/api/examinations/marks/",
  results: "/api/examinations/results/",
  rankings: "/api/examinations/rankings/",
  feeCategories: "/api/finance/fee-categories/",
  feeStructures: "/api/finance/fee-structures/",
  invoices: "/api/finance/invoices/",
  payments: "/api/finance/payments/",
  receipts: "/api/finance/receipts/",
  studentAccounts: "/api/finance/accounts/",
  discounts: "/api/finance/discounts/",
} as const;

export type Resource = keyof typeof ENDPOINTS;

/** The role-policy area guarding each endpoint (mirrors the backend viewsets' `policy`). */
export const AREAS: Record<Resource, Area> = {
  schools: "schools",
  auditLogs: "audit_logs",
  users: "users",
  roles: "roles",
  permissions: "roles",
  academicYears: "academics",
  terms: "academics",
  classes: "academics",
  streams: "academics",
  subjects: "academics",
  subjectAssignments: "subject_assignments",
  students: "students",
  parents: "guardians",
  guardians: "guardians",
  enrollments: "enrollments",
  documents: "documents",
  attendanceSessions: "attendance",
  attendanceRecords: "attendance",
  attendanceSummaries: "attendance_summaries",
  examTypes: "exams",
  exams: "exams",
  gradeScales: "exams",
  marks: "marks",
  results: "results",
  rankings: "results",
  feeCategories: "finance",
  feeStructures: "finance",
  invoices: "finance_ledger",
  payments: "finance_ledger",
  receipts: "finance_ledger",
  studentAccounts: "finance_ledger",
  discounts: "finance",
};

/** Error reported for a resource the user's roles cannot read (no request is made). */
export const NO_ACCESS = new Error("Your role does not have access to this.");

/** Whether the signed-in user may read (or write) a resource. */
export function useCan() {
  const { can } = useRole();
  return useCallback((resource: Resource, write = false) => can(AREAS[resource], write), [can]);
}

/** Every field name the UI reads from API rows (snake_case, as DRF returns them). */
type ApiField =
  | "absent_days" | "academic_class" | "academic_year" | "action" | "admission_date"
  | "admission_number" | "amount" | "assessment_type" | "attendance_date"
  | "attendance_percentage" | "attendance_session" | "balance" | "capacity" | "category"
  | "city" | "class_field" | "class_name" | "class_teacher" | "code" | "country"
  | "current_balance" | "current_class" | "current_stream" | "description" | "discount_type"
  | "display_order" | "document_type" | "due_date" | "education_level" | "email" | "end_date"
  | "enrollment_date" | "exam" | "exam_type" | "excused_days" | "fee_category" | "file"
  | "first_name" | "full_name" | "gender" | "grade" | "invoice" | "invoice_number"
  | "ip_address" | "is_active" | "is_compulsory" | "is_current" | "is_mandatory" | "is_published"
  | "is_superuser" | "is_system_role" | "issue_date" | "last_login" | "last_name"
  | "last_payment_date" | "late_days" | "marks_obtained" | "maximum_mark" | "minimum_mark"
  | "model_name" | "name" | "number" | "object_id" | "occupation" | "order" | "pass_mark"
  | "payment" | "payment_date" | "payment_method" | "payment_reference" | "percentage"
  | "permissions" | "phone_number" | "present_days" | "rank" | "receipt_number" | "records"
  | "registration_number" | "relationship" | "remarks" | "roles" | "school" | "session_type"
  | "short_name" | "start_date" | "status" | "stream" | "student" | "subject" | "teacher"
  | "term" | "time_marked" | "timestamp" | "total_amount" | "total_discount"
  | "total_invoiced" | "total_marks" | "total_paid" | "transaction_reference"
  | "uploaded_at" | "user" | "username" | "value";

/** A row from any list endpoint. Values are whatever the serializer returned. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = { id: number } & { [K in ApiField]?: any };

/** All rows of a list endpoint, cached under ["api", resource]. */
export function useList<T = Row>(resource: Resource, options: { enabled?: boolean } = {}) {
  const { status } = useAuth();
  const readable = useCan()(resource);
  const query = useQuery({
    queryKey: ["api", resource],
    queryFn: () => listAll<T>(ENDPOINTS[resource]),
    // Never fetch without a session (also keeps queries off the server render), and
    // never fetch what the user's roles cannot read.
    enabled: status === "authenticated" && readable && (options.enabled ?? true),
    staleTime: 30_000,
    retry: (count, error) => count < 1 && !(error && "status" in error && (error as { status: number }).status === 403),
  });
  if (status === "authenticated" && !readable) {
    return { ...query, data: undefined, error: NO_ACCESS, isLoading: false };
  }
  return query;
}

/** POST to a resource, then refetch it (and any extra resources whose numbers depend on it). */
export function useCreate(resource: Resource, alsoInvalidate: Resource[] = []) {
  const queryClient = useQueryClient();
  return useCallback(
    async (body: Record<string, unknown> | FormData) => {
      const created = await api<Row>(ENDPOINTS[resource], { method: "POST", body });
      for (const key of [resource, ...alsoInvalidate]) {
        await queryClient.invalidateQueries({ queryKey: ["api", key] });
      }
      return created;
    },
    [queryClient, resource, alsoInvalidate],
  );
}

const LABELS: Partial<Record<Resource, (row: Row) => string>> = {
  schools: (r) => String(r.name),
  users: (r) => `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim() || String(r.email),
  roles: (r) => String(r.name),
  academicYears: (r) => String(r.name),
  terms: (r) => String(r.name),
  classes: (r) => String(r.name),
  streams: (r) => String(r.name),
  subjects: (r) => String(r.name),
  students: (r) => `${r.full_name ?? `${r.first_name} ${r.last_name}`}`,
  guardians: (r) => `${r.first_name} ${r.last_name}`,
  examTypes: (r) => String(r.name),
  exams: (r) => String(r.name),
  feeCategories: (r) => String(r.name),
  invoices: (r) => String(r.invoice_number || `#${r.id}`),
};

/**
 * Resolves foreign-key ids to display names for a resource, and offers the rows as
 * select options for create forms.
 */
export function useLookup(resource: Resource, options: { enabled?: boolean } = {}) {
  const query = useList<Row>(resource, options);
  return useMemo(() => {
    const label = LABELS[resource] ?? ((r: Row) => String(r.name ?? r.id));
    const map = new Map<number, string>();
    for (const row of query.data ?? []) map.set(row.id, label(row));
    const opts: Option[] = (query.data ?? []).map((row) => ({ value: String(row.id), label: label(row) }));
    return {
      name: (id: unknown) => (id == null || id === "" ? "—" : (map.get(Number(id)) ?? `#${id}`)),
      options: opts,
      rows: query.data ?? [],
      loading: query.isLoading,
    };
  }, [query.data, query.isLoading, resource]);
}

/** A required "School" select, preset to the signed-in user's school. */
export function useSchoolField(): Field {
  const { user } = useAuth();
  const schools = useLookup("schools");
  const fallback = schools.options.length === 1 ? schools.options[0] : undefined;
  return {
    name: "school",
    label: "School",
    type: "select",
    required: true,
    half: true,
    options: schools.options,
    defaultValue:
      user?.school != null
        ? String(user.school)
        : fallback && typeof fallback !== "string"
          ? fallback.value
          : undefined,
    hint: schools.options.length ? undefined : "Create a school under Core › Schools first.",
  };
}

/** Id of the row flagged `is_current`, as a form default. */
export const currentId = (rows: Row[]) => {
  const current = rows.find((row) => row.is_current);
  return current ? String(current.id) : undefined;
};

/** Standard <head> for a page. */
export const pageHead = (title: string, description: string) => () => ({
  meta: [
    { title: `${title} — Scholaris ERP` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} — Scholaris ERP` },
    { property: "og:description", content: description },
  ],
});

/* ------------------------------------------------------------------ formatting */

/** "PARTIALLY_PAID" -> "Partially paid" */
export const humanize = (value: unknown) => {
  if (value == null || value === "") return "—";
  const text = String(value).replace(/_/g, " ").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/** Turn backend enum values into select options with readable labels. */
export const choices = (...values: string[]): Option[] =>
  values.map((value) => ({ value, label: humanize(value) }));

export const BOOLEAN_OPTIONS: Option[] = [
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];

export const yesNo = (value: unknown) => (value ? "Yes" : "No");
export const activeStatus = (active: unknown) => (active ? "Active" : "Inactive");

export const money = (value: unknown, currency = "KES") => {
  const n = Number(value);
  if (value == null || value === "" || Number.isNaN(n)) return "—";
  return `${currency} ${n.toLocaleString("en-KE", { maximumFractionDigits: 2 })}`;
};

export const shortDate = (value: unknown) => {
  if (!value) return "—";
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export const dateTime = (value: unknown) => {
  if (!value) return "—";
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
};

/**
 * Converts form strings into a JSON payload: blanks are dropped, listed fields become
 * numbers / booleans, everything else stays a string.
 */
export function payload(
  values: Record<string, string>,
  types: { numbers?: string[]; booleans?: string[] } = {},
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(values)) {
    const value = raw.trim();
    if (value === "") continue;
    if (types.numbers?.includes(key)) out[key] = Number(value);
    else if (types.booleans?.includes(key)) out[key] = value === "true";
    else out[key] = value;
  }
  return out;
}
