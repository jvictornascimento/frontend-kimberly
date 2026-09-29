import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  className?: string;
  tone?: "cream" | "white" | "sage";
}

const toneClass: Record<NonNullable<SectionProps["tone"]>, string> = {
  cream: "bg-background text-foreground",
  white: "bg-card text-card-foreground",
  sage: "bg-sage-deep text-cream",
};

export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
  className,
  tone = "cream",
}: SectionProps) {
  return (
    <section id={id} className={cn("px-5 py-16 sm:px-8 md:py-24", toneClass[tone], className)}>
      <div className="mx-auto w-full max-w-3xl">
        {(eyebrow || title || intro) && (
          <header className="max-w-xl">
            {eyebrow && (
              <p className={cn("eyebrow", tone === "sage" && "text-sage-light")}>{eyebrow}</p>
            )}
            {title && (
              <h2 className="font-display mt-3 text-3xl leading-tight text-balance md:text-4xl">
                {title}
              </h2>
            )}
            {intro && (
              <p
                className={cn(
                  "mt-4 text-sm leading-relaxed md:text-base",
                  tone === "sage" ? "text-cream/80" : "text-muted-foreground",
                )}
              >
                {intro}
              </p>
            )}
          </header>
        )}
        {children && <div className={cn(eyebrow || title ? "mt-10" : "")}>{children}</div>}
      </div>
    </section>
  );
}

export function GoldRule({ className }: { className?: string }) {
  return <div className={cn("rule-gold w-full", className)} aria-hidden />;
}
