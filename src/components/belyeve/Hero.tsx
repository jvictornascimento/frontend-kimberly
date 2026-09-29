import pattern from "@/assets/belyeve-pattern-sage.png.asset.json";
import { GUARANTEE_PER_SCOOP } from "@/data/scoops";

/**
 * Mídia do Hero. Substitua por vídeo real (vertical 9:16) quando existir:
 * { src: "https://...mp4", poster: "https://...jpg" }
 */
const HERO_VIDEO: { src: string; poster?: string } | null = null;

const total = GUARANTEE_PER_SCOOP.jewelry + GUARANTEE_PER_SCOOP.gifts;

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden px-5 pt-8 pb-12 sm:px-8 md:pt-16 md:pb-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: `url(${pattern.url})`, backgroundSize: "260px" }}
      />
      <div className="relative mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-[1fr_minmax(0,360px)] md:gap-14">
        <div>
          <p className="eyebrow">Scoop Surpresa BELYEVE</p>
          <h1 className="font-display mt-3 text-[2.5rem] leading-[1.05] text-balance sm:text-6xl">
            A cada Scoop, muitas surpresas.
          </h1>

          <div className="mt-6 flex items-stretch gap-4 border-l-2 border-gold pl-4">
            <div>
              <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">No mínimo</p>
              <p className="font-display text-4xl leading-none">{total} itens</p>
              <p className="mt-1 text-xs text-muted-foreground">em cada Scoop</p>
            </div>
            <div className="w-px bg-border" />
            <div className="flex flex-col justify-center text-sm leading-snug">
              <span>
                <strong className="font-semibold">{GUARANTEE_PER_SCOOP.jewelry} joias</strong>
              </span>
              <span>
                + <strong className="font-semibold">{GUARANTEE_PER_SCOOP.gifts} brindes</strong> surpresa
              </span>
            </div>
          </div>

          <a
            href="#escolher"
            className="mt-7 flex w-full items-center justify-center rounded-sm bg-primary px-8 py-4 text-sm font-semibold tracking-[0.16em] text-primary-foreground uppercase transition-colors hover:bg-sage md:inline-flex md:w-auto"
          >
            Quero meu Scoop
          </a>
          <a
            href="#como-funciona"
            className="mt-3 block text-center text-xs text-muted-foreground underline-offset-4 hover:underline md:text-left"
          >
            Primeira vez? Veja como funciona
          </a>
        </div>

        <HeroMedia />
      </div>
    </section>
  );
}

function HeroMedia() {
  return (
    <div className="mx-auto w-full max-w-[300px] md:max-w-none">
      <div className="relative aspect-[9/16] overflow-hidden rounded-sm border border-gold/60 bg-secondary">
        {HERO_VIDEO ? (
          <video
            src={HERO_VIDEO.src}
            poster={HERO_VIDEO.poster}
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <>
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.12]"
              style={{ backgroundImage: `url(${pattern.url})`, backgroundSize: "180px" }}
            />
            <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold">
                <span
                  aria-hidden
                  className="ml-1 h-0 w-0 border-y-[9px] border-l-[14px] border-y-transparent border-l-gold"
                />
              </span>
              <p className="font-display mt-5 text-2xl">Vídeo do Scoop</p>
              <p className="mt-2 text-xs text-muted-foreground">Em breve, um Scoop real feito pela Kimberly.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
