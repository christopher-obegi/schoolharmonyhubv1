import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { ROLE_SECTIONS, canWrite, type Role } from "@/lib/erp-data";

type RoleContextValue = {
  role: Role;
  setRole: (role: Role) => void;
  sections: string[];
  writable: boolean;
};

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("Super Admin");

  const value = useMemo<RoleContextValue>(
    () => ({ role, setRole, sections: ROLE_SECTIONS[role], writable: canWrite(role) }),
    [role],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    return {
      role: "Super Admin" as Role,
      setRole: () => {},
      sections: ROLE_SECTIONS["Super Admin"],
      writable: true,
    };
  }
  return ctx;
}
