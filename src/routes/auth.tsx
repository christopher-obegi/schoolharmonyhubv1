import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/erp/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRole } from "@/components/erp/role-context";
import { ROLES, type Role } from "@/lib/erp-data";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Scholaris ERP" },
      {
        name: "description",
        content: "Sign in to Scholaris ERP to manage students, academics, attendance and fees.",
      },
      { property: "og:title", content: "Sign in — Scholaris ERP" },
      { property: "og:description", content: "Secure, role-based access to your school ERP." },
    ],
  }),
  component: SignIn,
});

function SignIn() {
  const navigate = useNavigate();
  const { setRole } = useRole();
  const [email, setEmail] = useState("amina.hassan@scholaris.io");
  const [password, setPassword] = useState("");
  const [role, setLocalRole] = useState<Role>("Super Admin");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.includes("@") || password.length < 4) {
      setError("Enter a valid email and a password of at least 4 characters.");
      return;
    }
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setRole(role);
      setLoading(false);
      toast.success(`Signed in as ${role}`);
      navigate({ to: "/" });
    }, 600);
  };

  return (
    <AuthLayout
      title="Sign in to Scholaris"
      description="Use your school-issued credentials. Access adapts to your assigned role."
      footer={
        <p className="text-xs text-muted-foreground">
          Trouble signing in? Contact your school administrator.
        </p>
      }
    >
      <form className="space-y-4" onSubmit={submit}>
        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@school.io"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Sign in as</Label>
          <Select value={role} onValueChange={(v) => setLocalRole(v as Role)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  );
}
