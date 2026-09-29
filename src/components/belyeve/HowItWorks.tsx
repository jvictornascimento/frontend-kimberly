import { Section } from "./Section";
import { HOW_IT_WORKS_STEPS } from "@/data/content";

export function HowItWorks() {
  return (
    <Section
      id="como-funciona"
      eyebrow="Como funciona"
      title="Quatro passos, uma surpresa."
    >
      <ol className="divide-y divide-border border-y border-border">
        {HOW_IT_WORKS_STEPS.map((step, i) => (
          <li key={step.title} className="grid grid-cols-[auto_minmax(0,1fr)] gap-5 py-6">
            <span className="font-display shrink-0 text-2xl text-gold-deep">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
