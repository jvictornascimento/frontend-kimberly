import { HOW_IT_WORKS_STEPS } from "@/data/content";
import { MEDIA } from "@/data/media";
import { MediaImage } from "./MediaImage";
import { Reveal } from "./Reveal";

export function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-background px-5 py-16 sm:px-8 md:py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <p className="eyebrow">A jornada</p>
          <h2 className="font-display mt-3 text-4xl leading-tight sm:text-5xl">Como funciona?</h2>
        </Reveal>

        <div className="mt-10 grid gap-12 md:grid-cols-[1fr_minmax(0,320px)] md:gap-16">
          {/* Linha do tempo */}
          <ol className="relative">
            <span aria-hidden className="absolute top-3 bottom-3 left-[1.15rem] w-px bg-gold/50" />
            {HOW_IT_WORKS_STEPS.map((step, i) => (
              <li key={step.title} className="relative pb-10 pl-14 last:pb-0">
                <span className="font-display absolute top-0 left-0 flex h-[2.3rem] w-[2.3rem] items-center justify-center rounded-full border border-gold bg-background text-lg text-gold-deep">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Reveal delay={i * 80}>
                  <h3 className="font-display pt-1 text-2xl leading-tight">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                  {step.detail && (
                    <p className="mt-3 inline-block border-l-2 border-gold pl-3 text-sm font-semibold">
                      {step.detail}
                    </p>
                  )}
                  {step.note && (
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                      {step.note}
                    </p>
                  )}
                </Reveal>
              </li>
            ))}
          </ol>

          <Reveal delay={200} className="hidden md:block">
            <div className="sticky top-24">
              <MediaImage item={MEDIA.box} ratio="4/5" />
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-12 md:hidden">
          <MediaImage item={MEDIA.box} ratio="4/3" />
        </Reveal>
      </div>
    </section>
  );
}
