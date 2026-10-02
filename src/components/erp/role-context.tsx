import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import type { Role } from "@/lib/erp-data";
import { rolesFor, useAuth } from "@/lib/auth";

/** Areas of the API's role policy (backend core/access.py POLICY keys). */
export type Area =
  | "schools"
  | "audit_logs"
  | "users"
  | "roles"
  | "academics"
  | "subject_assignments"
  | "students"
  | "guardians"
  | "enrollments"
  | "documents"
  | "attendance"
  | "attendance_summaries"
  | "exams"
  | "marks"
  | "results"
  | "finance"
  | "finance_ledger";

type RoleContextValue = {
  /** The user's highest role, for display. */
  role: Role | "No role";
  /** Every role the user holds. */
  roles: Role[];
  /** Whether the API allows this user to read (or write) an area. */
  can: (area: Area, write?: boolean) => boolean;
  /** Parent/student with no staff role: only their own records. */
  portalOnly: boolean;
  /** Holds a parent or student role (alone or alongside staff roles). */
  hasPortal: boolean;
};

const RoleContext = createContext<RoleContextValue | null>(null);

/**
 * Exposes the signed-in user's roles and access. Access comes from the API
 * (GET /api/accounts/profile/ `access`), so the UI shows exactly what the server allows,
 * including the union of rights for users with several roles.
 */
export function RoleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const can = useCallback(
    (area: Area, write = false) => {
      if (!user) return false;
      if (user.is_superuser) return true;
      const rights = user.access?.[area];
      return Boolean(write ? rights?.write : rights?.read);
    },
    [user],
  );

  const value = useMemo<RoleContextValue>(() => {
    const roles = user ? rolesFor(user) : [];
    return {
      role: roles[0] ?? "No role",
      roles,
      can,
      portalOnly: Boolean(user?.portal_only),
      hasPortal: roles.includes("Parent") || roles.includes("Student"),
    };
  }, [user, can]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used inside <RoleProvider>");
  return ctx;
}
