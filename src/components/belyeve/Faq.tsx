import { useState } from "react";
import { Section } from "./Section";
import { FAQ_ITEMS } from "@/data/content";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section id="faq" eyebrow="Dúvidas" title="Perguntas frequentes.">
      <div className="border-t border-border">
        {FAQ_ITEMS.map((item, i) => {
          const expanded = open === i;
          return (
            <div key={item.q} className="border-b border-border">
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : i)}
                aria-expanded={expanded}
                className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-5 text-left"
              >
                <span className="min-w-0 text-sm font-medium">{item.q}</span>
                <span className="shrink-0 text-gold-deep" aria-hidden>
                  {expanded ? "−" : "+"}
                </span>
              </button>
              {expanded && (
                <p className="pb-5 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}
