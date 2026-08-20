import * as React from "react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Pencil, X } from "lucide-react";

/**
 * Shared building blocks for the Settings screens.
 *
 * Keeping the section / card / row / pill patterns in one place makes every
 * tab consistent and far shorter, and lets us tune spacing, borders and motion
 * from a single spot.
 */

/* -------------------------------------------------------------------------- */
/*  Page + section scaffolding                                                */
/* -------------------------------------------------------------------------- */

export interface SettingsPageProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  danger?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function SettingsPage({ title, description, icon, danger, children, className }: SettingsPageProps) {
  return (
    <div className={cn("space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300", className)}>
      <header className="space-y-1">
        <h2 className={cn("flex items-center gap-2.5 text-2xl font-bold tracking-tight", danger && "text-destructive")}>
          {icon}
          {title}
        </h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </header>
      {children}
    </div>
  );
}

export interface SettingsSectionProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function SettingsSection({ title, description, children, className }: SettingsSectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      {title || description ? (
        <div className="space-y-1">
          {title ? (
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
          ) : null}
          {description ? <p className="text-xs text-muted-foreground/80">{description}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Card                                                                      */
/* -------------------------------------------------------------------------- */

export interface SettingsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
  interactive?: boolean;
}

export const SettingsCard = React.forwardRef<HTMLDivElement, SettingsCardProps>(
  ({ className, padded = true, interactive = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-border/40 bg-muted/10",
        padded && "p-5",
        interactive && "transition-colors hover:border-border/60 hover:bg-muted/20",
        className,
      )}
      {...props}
    />
  ),
);
SettingsCard.displayName = "SettingsCard";

/* -------------------------------------------------------------------------- */
/*  Rows                                                                      */
/* -------------------------------------------------------------------------- */

export interface SettingRowProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  control: React.ReactNode;
  htmlFor?: string;
  className?: string;
}

export function SettingRow({ title, description, icon, control, htmlFor, className }: SettingRowProps) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="space-y-1 sm:max-w-[70%]">
        <Label htmlFor={htmlFor} className="flex items-center gap-2 font-medium">
          {icon}
          {title}
        </Label>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

export interface ToggleRowProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  id?: string;
  disabled?: boolean;
}

export const ToggleRow = React.memo(function ToggleRow({
  title,
  description,
  icon,
  checked,
  onCheckedChange,
  id,
  disabled,
}: ToggleRowProps) {
  return (
    <SettingRow
      title={title}
      description={description}
      icon={icon}
      htmlFor={id}
      control={<Switch id={id} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />}
    />
  );
});

/* -------------------------------------------------------------------------- */
/*  Pill / badge                                                              */
/* -------------------------------------------------------------------------- */

export type PillTone = "neutral" | "primary" | "success" | "danger" | "warning";

const PILL_TONES: Record<PillTone, string> = {
  neutral: "bg-muted text-muted-foreground border-border/50",
  primary: "bg-primary/10 text-primary border-primary/20",
  success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  danger: "bg-destructive/10 text-destructive border-destructive/20",
  warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
};

export interface PillProps {
  tone?: PillTone;
  className?: string;
  children: React.ReactNode;
}

export function Pill({ tone = "neutral", className, children }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        PILL_TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Editable field (view -> inline edit)                                      */
/* -------------------------------------------------------------------------- */

export interface EditableFieldProps {
  label: string;
  value: string;
  onSave: (value: string) => void | Promise<void>;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  editLabel?: string;
  autoComplete?: string;
  display?: React.ReactNode;
}

export function EditableField({
  label,
  value,
  onSave,
  type = "text",
  placeholder,
  editLabel = "Edit",
  autoComplete,
  display,
}: EditableFieldProps) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const [saving, setSaving] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  React.useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await onSave(draft.trim());
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {editing ? (
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            type={type}
            value={draft}
            placeholder={placeholder}
            autoComplete={autoComplete}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") cancel();
            }}
            className="max-w-md"
          />
          <Button
            size="icon"
            variant="ghost"
            className="text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-500"
            onClick={commit}
            disabled={saving}
            aria-label={`Save ${label}`}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={cancel}
            disabled={saving}
            aria-label={`Cancel editing ${label}`}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex max-w-md items-center justify-between rounded-lg border border-border/30 bg-background p-3">
          <div className="text-sm font-medium">{display ?? value}</div>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto gap-1.5 px-2 py-1 text-xs"
            onClick={() => setEditing(true)}
          >
            <Pencil className="h-3 w-3" />
            {editLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
