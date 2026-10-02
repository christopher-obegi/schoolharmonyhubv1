import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api, onSessionExpired, tokens } from "./api";
import type { Role } from "./erp-data";

/** The user as returned by GET /api/accounts/profile/. */
export type ApiUser = {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser?: boolean;
  is_verified: boolean;
  date_joined: string;
  last_login?: string | null;
  school: number | null;
  roles: string[];
  /** Per-area read/write rights, evaluated by the API's role policy (core/access.py). */
  access?: Record<string, { read: boolean; write: boolean }>;
  /** Parent/student with no staff role: sees only their own records. */
  portal_only?: boolean;
};

/** Backend role codes, highest privilege first, mapped onto the UI's role names. */
const ROLE_CODES: [string, Role][] = [
  ["SUPER_ADMIN", "Super Admin"],
  ["SCHOOL_ADMIN", "School Admin"],
  ["ADMISSIONS_OFFICER", "Admissions Officer"],
  ["EXAM_ADMIN", "Exam Admin"],
  ["FINANCE_OFFICER", "Finance Officer"],
  ["TEACHER", "Teacher"],
  ["PARENT", "Parent"],
  ["STUDENT", "Student"],
];

/** Every UI role a user holds, highest privilege first (a user may hold several). */
export function rolesFor(user: ApiUser): Role[] {
  const roles = ROLE_CODES.filter(([code]) => user.roles.includes(code)).map(([, role]) => role);
  return user.is_superuser ? ["Super Admin", ...roles.filter((r) => r !== "Super Admin")] : roles;
}

export function displayName(user: ApiUser) {
  const full = `${user.first_name} ${user.last_name}`.trim();
  return full || user.username || user.email;
}

type AuthStatus = "loading" | "authenticated" | "anonymous";

type AuthContextValue = {
  status: AuthStatus;
  user: ApiUser | null;
  login: (email: string, password: string) => Promise<ApiUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<ApiUser>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<ApiUser | null>(null);

  const signOutLocally = useCallback(() => {
    tokens.clear();
    setUser(null);
    setStatus("anonymous");
    queryClient.clear();
  }, [queryClient]);

  const refreshUser = useCallback(async () => {
    const me = await api<ApiUser>("/api/accounts/profile/");
    setUser(me);
    setStatus("authenticated");
    return me;
  }, []);

  // Restore the session on first load (client only; tokens live in localStorage).
  useEffect(() => {
    if (!tokens.access && !tokens.refresh) {
      setStatus("anonymous");
      return;
    }
    refreshUser().catch(signOutLocally);
  }, [refreshUser, signOutLocally]);

  useEffect(() => onSessionExpired(signOutLocally), [signOutLocally]);

  const login = useCallback(
    async (email: string, password: string) => {
      const pair = await api<{ access: string; refresh: string }>("/api/accounts/auth/login/", {
        method: "POST",
        body: { email, password },
        auth: false,
      });
      tokens.set(pair.access, pair.refresh);
      return refreshUser();
    },
    [refreshUser],
  );

  const logout = useCallback(async () => {
    const refresh = tokens.refresh;
    if (refresh) {
      // Blacklist the refresh token; sign out locally even if this fails.
      await api("/api/accounts/auth/logout/", { method: "POST", body: { refresh } }).catch(() => {});
    }
    signOutLocally();
  }, [signOutLocally]);

  const value = useMemo(
    () => ({ status, user, login, logout, refreshUser }),
    [status, user, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
