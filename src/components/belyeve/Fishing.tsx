import { Section } from "./Section";
import { FISHING_POINTS } from "@/data/content";

export function Fishing() {
  return (
    <Section
      id="pesca"
      tone="white"
      eyebrow="A pesca"
      title="Como funciona a pesca."
      intro="A pesca é o momento que define o conteúdo do seu Scoop."
    >
      <ul className="space-y-4">
        {FISHING_POINTS.map((point) => (
          <li key={point} className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
            <span className="min-w-0 text-sm leading-relaxed">{point}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
