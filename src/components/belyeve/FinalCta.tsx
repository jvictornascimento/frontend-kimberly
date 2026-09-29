import pattern from "@/assets/belyeve-pattern-gold.png.asset.json";

export function FinalCta() {
  return (
    <section id="cta-final" className="relative overflow-hidden bg-secondary px-5 py-20 sm:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{ backgroundImage: `url(${pattern.url})`, backgroundSize: "220px" }}
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <p className="eyebrow">Sua vez</p>
        <h2 className="font-display mt-3 text-3xl leading-tight text-balance md:text-4xl">
          A cada Scoop, muitas surpresas. Qual será a sua?
        </h2>
        <a
          href="#escolher"
          data-analytics="cta_final"
          className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-sm bg-primary px-8 py-4 text-sm font-semibold tracking-[0.16em] text-primary-foreground uppercase transition-colors hover:bg-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:w-auto"
        >
          Quero meu Scoop
        </a>
      </div>
    </section>
  );
}
