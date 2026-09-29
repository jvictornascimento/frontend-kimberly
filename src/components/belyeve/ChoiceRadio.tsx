import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChoiceRadioProps {
  name: string;
  checked: boolean;
  onSelect: () => void;
  title: ReactNode;
  description?: ReactNode | undefined;
  aside?: ReactNode | undefined;
  center?: boolean;
  describedBy?: string | undefined;
}

/** Native radio styled as a tappable option. */
export function ChoiceRadio({ name, checked, onSelect, title, description, aside, center, describedBy }: ChoiceRadioProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-sm border px-4 py-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sage",
        checked ? "border-gold bg-secondary/50" : "border-border bg-background hover:border-sage",
        center && "items-center justify-center",
      )}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onSelect}
        aria-describedby={describedBy}
        className="sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
          checked ? "border-gold" : "border-muted-foreground/50",
          center && "mt-0",
        )}
      >
        {checked && <span className="h-2 w-2 rounded-full bg-gold" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold tracking-[0.12em] uppercase">{title}</span>
        {description && <span className="mt-1 block text-xs text-muted-foreground">{description}</span>}
      </span>
      {aside && <span className="shrink-0 text-sm font-semibold tabular-nums">{aside}</span>}
    </label>
  );
}
