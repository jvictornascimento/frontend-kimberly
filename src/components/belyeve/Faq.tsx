import { useState } from "react";
import { Section } from "./Section";
import { FAQ_ITEMS } from "@/data/content";

export function Faq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <Section id="faq" tone="white" eyebrow="Dúvidas" title="Perguntas frequentes">
      <div className="mt-8 border-t border-border">
        {FAQ_ITEMS.map((item, i) => {
          const expanded = open === i;
          const panelId = `faq-panel-${i}`;
          const buttonId = `faq-button-${i}`;
          return (
            <div key={item.q} className="border-b border-border">
              <h3>
                <button
                  id={buttonId}
                  type="button"
                  onClick={() => setOpen(expanded ? null : i)}
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  className="grid min-h-12 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <span className="min-w-0 text-sm font-medium">{item.q}</span>
                  <span className="shrink-0 text-lg leading-none text-gold-deep" aria-hidden>
                    {expanded ? "−" : "+"}
                  </span>
                </button>
              </h3>
              <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!expanded}>
                <p className="max-w-xl pb-5 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
