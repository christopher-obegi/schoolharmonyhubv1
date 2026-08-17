import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export type Field = {
  name: string;
  label: string;
  type?: "text" | "email" | "number" | "date" | "select" | "textarea";
  options?: string[];
  placeholder?: string;
  required?: boolean;
  hint?: string;
  half?: boolean;
};

/** Reusable create/edit dialog with inline field validation and polished states. */
export function RecordDialog({
  trigger,
  title,
  description,
  fields,
  submitLabel = "Save record",
  onSubmit,
}: {
  trigger: ReactNode;
  title: string;
  description?: string;
  fields: Field[];
  submitLabel?: string;
  onSubmit?: (values: Record<string, string>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = (name: string, value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => ({ ...e, [name]: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    for (const field of fields) {
      const raw = (values[field.name] ?? "").trim();
      if (field.required && !raw) {
        next[field.name] = `${field.label} is required`;
        continue;
      }
      if (!raw) continue;
      if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(raw)) {
        next[field.name] = "Enter a valid email address";
      }
      if (field.type === "number" && Number.isNaN(Number(raw))) {
        next[field.name] = "Enter a valid number";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!validate()) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 550));
    setSaving(false);
    setOpen(false);
    setValues({});
    onSubmit?.(values);
    toast.success(`${title} saved`, { description: "Changes recorded in the demo dataset." });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display">{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>

        <div className="grid gap-4 py-1 sm:grid-cols-2">
          {fields.map((field) => (
            <div
              key={field.name}
              className={field.half ? "space-y-1.5" : "space-y-1.5 sm:col-span-2"}
            >
              <Label htmlFor={field.name} className="text-xs">
                {field.label}
                {field.required ? <span className="ml-0.5 text-destructive">*</span> : null}
              </Label>

              {field.type === "select" ? (
                <Select
                  value={values[field.name] ?? ""}
                  onValueChange={(v) => set(field.name, v)}
                >
                  <SelectTrigger id={field.name}>
                    <SelectValue placeholder={field.placeholder ?? "Select…"} />
                  </SelectTrigger>
                  <SelectContent>
                    {(field.options ?? []).map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field.type === "textarea" ? (
                <Textarea
                  id={field.name}
                  value={values[field.name] ?? ""}
                  placeholder={field.placeholder}
                  onChange={(e) => set(field.name, e.target.value)}
                />
              ) : (
                <Input
                  id={field.name}
                  type={field.type ?? "text"}
                  value={values[field.name] ?? ""}
                  placeholder={field.placeholder}
                  onChange={(e) => set(field.name, e.target.value)}
                  aria-invalid={Boolean(errors[field.name])}
                />
              )}

              {errors[field.name] ? (
                <p className="text-xs text-destructive">{errors[field.name]}</p>
              ) : field.hint ? (
                <p className="text-xs text-muted-foreground">{field.hint}</p>
              ) : null}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? "Saving…" : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  destructive,
  onConfirm,
}: {
  trigger: ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm?: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display">{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={destructive ? "bg-destructive text-destructive-foreground" : undefined}
            onClick={() => {
              onConfirm?.();
              toast.success(`${confirmLabel} completed`);
            }}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
