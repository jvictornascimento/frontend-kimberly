import { GUARANTEE_PER_SCOOP, METAL_CATEGORIES } from "@/data/scoops";
import { MEDIA } from "@/data/media";
import { MediaImage } from "./MediaImage";
import { Reveal } from "./Reveal";

const total = GUARANTEE_PER_SCOOP.jewelry + GUARANTEE_PER_SCOOP.gifts;

export function Guarantee() {
  return (
    <section id="garantia" className="bg-sage-deep px-5 py-16 text-cream sm:px-8 md:py-24">
      <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-[1.1fr_1fr] md:gap-16">
        <Reveal>
          <p className="eyebrow text-sage-light">Mínimo garantido</p>
          <h2 className="font-display mt-3 text-4xl leading-[1.05] text-balance sm:text-5xl">
            Cada Scoop garante no mínimo {total} itens.
          </h2>

          <div className="mt-8 flex items-end gap-4 sm:gap-6">
            <div>
              <p className="font-display text-6xl leading-none sm:text-7xl">
                {GUARANTEE_PER_SCOOP.jewelry}
              </p>
              <p className="mt-2 text-xs font-semibold tracking-[0.18em] uppercase">Joias</p>
            </div>
            <span className="font-display pb-7 text-4xl text-gold">+</span>
            <div>
              <p className="font-display text-6xl leading-none sm:text-7xl">
                {GUARANTEE_PER_SCOOP.gifts}
              </p>
              <p className="mt-2 text-xs font-semibold tracking-[0.18em] uppercase">
                Brindes surpresa
              </p>
            </div>
          </div>

          <dl className="mt-8 space-y-3 border-t border-cream/20 pt-6 text-sm">
            {METAL_CATEGORIES.map((c) => (
              <div key={c.value} className="flex flex-wrap gap-x-2">
                <dt className="font-semibold">{c.label}:</dt>
                <dd className="text-cream/80">{c.description.toLowerCase()}.</dd>
              </div>
            ))}
          </dl>

          <p className="mt-8 text-sm leading-relaxed text-cream/85">
            {total} itens é o mínimo. Se a pesca trouxer pacotinhos a mais, eles também vão para
            você.
          </p>
          <p className="font-display mt-2 text-2xl text-gold">Encontrou mais? É seu. ✨</p>
        </Reveal>

        <Reveal delay={150}>
          <MediaImage item={MEDIA.scoop} ratio="4/5" className="mx-auto w-full max-w-sm" />
        </Reveal>
      </div>
    </section>
  );
}
