import { Section } from "./Section";
import { GIFT_CATEGORIES, JEWELRY_CATEGORIES } from "@/data/scoops";

export function InsideScoop() {
  return (
    <Section
      id="conteudo"
      tone="white"
      eyebrow="O que pode vir"
      title="O que pode aparecer no seu Scoop."
      intro="Categorias possíveis. A combinação exata é sempre surpresa."
    >
      <div className="grid gap-10 sm:grid-cols-2">
        <div>
          <h3 className="eyebrow">Joias</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {JEWELRY_CATEGORIES.map((item) => (
              <li key={item} className="border-b border-border pb-2">
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="eyebrow">Brindes</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {GIFT_CATEGORIES.map((item) => (
              <li key={item} className="border-b border-border pb-2">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
