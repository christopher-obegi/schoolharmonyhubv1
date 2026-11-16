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

export type Option = string | { value: string; label: string };

export type Field = {
  name: string;
  label: string;
  /** "checkboxes": several options; the value is the chosen option values joined by commas. */
  type?:
    | "text"
    | "email"
    | "password"
    | "number"
    | "date"
    | "select"
    | "textarea"
    | "file"
    | "checkboxes";
  options?: Option[] | undefined;
  placeholder?: string | undefined;
  required?: boolean | undefined;
  hint?: string | undefined;
  half?: boolean | undefined;
  defaultValue?: string | undefined;
};

const optionValue = (option: Option) => (typeof option === "string" ? option : option.value);
const optionLabel = (option: Option) => (typeof option === "string" ? option : option.label);

const initialValues = (fields: Field[]) =>
  Object.fromEntries(
    fields.flatMap((f) => (f.defaultValue === undefined ? [] : [[f.name, f.defaultValue]])),
  );

/**
 * Reusable create/edit dialog with inline field validation and polished states.
 * `onSubmit` may be async; if it throws, the dialog stays open and any `fieldErrors`
 * on the error (e.g. DRF validation errors) are shown under the matching fields.
 */
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
  description?: string | undefined;
  fields: Field[];
  submitLabel?: string | undefined;
  /** `files` holds the File chosen for each "file" field. */
  onSubmit?: (values: Record<string, string>, files: Record<string, File>) => void | Promise<void>;
}) {
  const [open, setOpenState] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const setOpen = (next: boolean) => {
    if (next) {
      setValues(initialValues(fields));
      setFiles({});
      setErrors({});
      setFormError(null);
    }
    setOpenState(next);
  };
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = (name: string, value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => ({ ...e, [name]: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    for (const field of fields) {
      const raw =
        field.type === "file" ? (files[field.name]?.name ?? "") : (values[field.name] ?? "").trim();
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
    setFormError(null);
    try {
      await onSubmit?.(values, files);
      setOpen(false);
      toast.success(`${title}: saved`);
    } catch (err) {
      const fieldErrors =
        err && typeof err === "object" && "fieldErrors" in err
          ? (err.fieldErrors as Record<string, string>)
          : {};
      const known = Object.fromEntries(
        Object.entries(fieldErrors).filter(([key]) => fields.some((f) => f.name === key)),
      );
      setErrors(known);
      const unmatched = Object.keys(fieldErrors).length > Object.keys(known).length;
      const message = err instanceof Error ? err.message : "Could not save";
      setFormError(
        Object.keys(known).length && !unmatched ? "Please fix the highlighted fields." : message,
      );
    } finally {
      setSaving(false);
    }
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
                <Select value={values[field.name] ?? ""} onValueChange={(v) => set(field.name, v)}>
                  <SelectTrigger id={field.name}>
                    <SelectValue placeholder={field.placeholder ?? "Select…"} />
                  </SelectTrigger>
                  <SelectContent>
                    {(field.options ?? []).map((option) => (
                      <SelectItem key={optionValue(option)} value={optionValue(option)}>
                        {optionLabel(option)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field.type === "checkboxes" ? (
                <div
                  id={field.name}
                  className="grid gap-2 rounded-md border border-input p-3 sm:grid-cols-2"
                >
                  {(field.options ?? []).map((option) => {
                    const value = optionValue(option);
                    const chosen = (values[field.name] ?? "").split(",").filter(Boolean);
                    return (
                      <label key={value} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="size-4 accent-primary"
                          checked={chosen.includes(value)}
                          onChange={(e) =>
                            set(
                              field.name,
                              (e.target.checked
                                ? [...chosen, value]
                                : chosen.filter((v) => v !== value)
                              ).join(","),
                            )
                          }
                        />
                        {optionLabel(option)}
                      </label>
                    );
                  })}
                </div>
              ) : field.type === "file" ? (
                <Input
                  id={field.name}
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setFiles((f) => {
                      const next = { ...f };
                      if (file) next[field.name] = file;
                      else delete next[field.name];
                      return next;
                    });
                    setErrors((errs) => ({ ...errs, [field.name]: "" }));
                  }}
                  aria-invalid={Boolean(errors[field.name])}
                />
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

        {formError ? (
          <p
            role="alert"
            className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive"
          >
            {formError}
          </p>
        ) : null}

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
  onConfirm?: () => void | Promise<void>;
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
              // The caller reports success or failure (onConfirm may be async).
              void onConfirm?.();
            }}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
