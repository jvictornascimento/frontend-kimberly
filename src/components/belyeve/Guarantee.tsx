import { Section } from "./Section";
import { GUARANTEE_PER_SCOOP } from "@/data/scoops";

export function Guarantee() {
  return (
    <Section
      id="garantia"
      tone="sage"
      eyebrow="Mínimo garantido"
      title="Você nunca recebe menos do que isso."
      intro="Independente do que acontecer na pesca, cada Scoop chega com o mínimo garantido."
    >
      <div className="grid gap-px overflow-hidden rounded-sm bg-cream/20 sm:grid-cols-2">
        <div className="bg-sage-deep p-8">
          <p className="font-display text-5xl">{GUARANTEE_PER_SCOOP.jewelry}</p>
          <p className="mt-2 text-sm text-cream/80">joias por Scoop</p>
        </div>
        <div className="bg-sage-deep p-8">
          <p className="font-display text-5xl">{GUARANTEE_PER_SCOOP.gifts}</p>
          <p className="mt-2 text-sm text-cream/80">brindes surpresa por Scoop</p>
        </div>
      </div>
      <p className="mt-6 text-sm text-cream/80">
        Se a pesca trouxer pacotes extras, os itens extras também são seus.
      </p>
    </Section>
  );
}
