import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TextFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "id"
> {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | undefined;
  hint?: ReactNode | undefined;
  optional?: boolean | undefined;
}

export function TextField({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  optional,
  className,
  ...rest
}: TextFieldProps) {
  const describedBy =
    [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="text-xs font-medium text-foreground">
        {label}
        {optional && <span className="ml-1 font-normal text-muted-foreground">(opcional)</span>}
      </label>
      <input
        {...rest}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "mt-1 w-full rounded-sm border bg-background px-4 py-3 text-base outline-none transition-colors focus:border-sage focus-visible:ring-2 focus-visible:ring-sage/40",
          error ? "border-destructive" : "border-input",
        )}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function PrimaryButton({
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      className={cn(
        "w-full rounded-sm bg-primary px-8 py-4 text-sm font-semibold tracking-[0.16em] text-primary-foreground uppercase transition-colors hover:bg-sage focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function TextButton({
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      className={cn(
        "text-xs font-medium underline underline-offset-4 hover:text-sage-deep",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function StepHeader({ title, description }: { title: string; description?: ReactNode }) {
  return (
    <header>
      <h2 className="font-display text-3xl leading-tight">{title}</h2>
      {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
    </header>
  );
}

export function Notice({
  tone = "neutral",
  children,
  role,
}: {
  tone?: "neutral" | "success" | "error";
  children: ReactNode;
  role?: "status" | "alert";
}) {
  return (
    <div
      role={role}
      className={cn(
        "border-l-2 px-3 py-2 text-sm",
        tone === "success" && "border-sage-deep bg-sage-light/40",
        tone === "error" && "border-destructive bg-destructive/5",
        tone === "neutral" && "border-gold bg-secondary/40",
      )}
    >
      {children}
    </div>
  );
}
