import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  ChevronRight,
  GraduationCap,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  X,
} from "lucide-react";
import { NAV } from "./nav-config";
import { useRole } from "./role-context";
import { ROLES, type Role } from "@/lib/erp-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

function useDarkMode() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return { dark, toggle: () => setDark((d) => !d) };
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useRouterState({ select: (s) => s.location });
  const { sections } = useRole();

  const visible = useMemo(
    () => NAV.filter((group) => group.section === "Overview" || sections.includes(group.section)),
    [sections],
  );

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="bg-gradient-brand grid size-9 place-items-center rounded-xl shadow-lift">
          <GraduationCap className="size-5 text-primary-foreground" />
        </span>
        <div className="min-w-0">
          <p className="font-display truncate text-sm font-semibold text-sidebar-accent-foreground">
            Scholaris ERP
          </p>
          <p className="truncate text-[11px] text-sidebar-foreground/70">Multi-school platform</p>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-6">
        {visible.map((group) => (
          <div key={group.section}>
            <p className="px-2 pb-1.5 text-[10px] font-semibold tracking-[0.12em] text-sidebar-foreground/50 uppercase">
              {group.section}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  item.url === "/" ? pathname === "/" : pathname.startsWith(item.url);
                return (
                  <li key={item.url}>
                    <Link
                      to={item.url as "/"}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                        active
                          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <item.icon
                        className={cn("size-4 shrink-0", active && "text-sidebar-primary")}
                      />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-4 py-3 text-[11px] text-sidebar-foreground/60">
        Term 2 · AY 2026 · v2.4.0
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useRouterState({ select: (s) => s.location });
  const { role, setRole } = useRole();
  const { dark, toggle } = useDarkMode();
  const [mobileOpen, setMobileOpen] = useState(false);

  const crumbs = pathname.split("/").filter(Boolean);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed top-0 bottom-0 w-64">
          <SidebarContent />
        </div>
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 border-none p-0">
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="size-5" />
            </Button>

            <div className="relative hidden max-w-sm flex-1 md:block">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search students, invoices, exams…"
                className="bg-background pl-9"
              />
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger className="h-9 w-[9.5rem] bg-background text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r} className="text-xs">
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
                {dark ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
              </Button>

              <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                <Bell className="size-4.5" />
                <span className="absolute top-2 right-2 size-2 rounded-full bg-destructive" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full border border-border p-0.5 pr-2.5 transition-colors hover:bg-accent/40">
                    <Avatar className="size-7">
                      <AvatarFallback className="bg-primary text-[11px] text-primary-foreground">
                        AH
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden text-xs font-medium sm:inline">Amina H.</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                    amina.hassan@scholaris.io
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={"/accounts/profile" as "/"}>Profile & settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={"/me" as "/"}>My portal</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={"/auth/login" as "/"} className="text-destructive">
                      <LogOut className="mr-2 size-4" /> Sign out
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {crumbs.length ? (
            <div className="flex items-center gap-1 border-t border-border px-4 py-2 text-[11px] text-muted-foreground lg:px-6">
              <Link to="/" className="hover:text-foreground">
                Home
              </Link>
              {crumbs.map((crumb, i) => (
                <span key={`${crumb}-${i}`} className="flex items-center gap-1">
                  <ChevronRight className="size-3" />
                  <span className="capitalize">{crumb.replace(/-/g, " ")}</span>
                </span>
              ))}
            </div>
          ) : null}
        </header>

        <main className="min-w-0 flex-1 space-y-6 px-4 py-6 lg:px-6 lg:py-8">{children}</main>

        <footer className="border-t border-border px-4 py-4 text-xs text-muted-foreground lg:px-6">
          © 2026 Scholaris ERP · Demo data only
        </footer>
      </div>
    </div>
  );
}

export function CloseIcon() {
  return <X className="size-4" />;
}
