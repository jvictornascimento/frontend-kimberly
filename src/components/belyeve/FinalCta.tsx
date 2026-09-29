import pattern from "@/assets/belyeve-pattern-gold.png.asset.json";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-secondary px-5 py-20 sm:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{ backgroundImage: `url(${pattern.url})`, backgroundSize: "220px" }}
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <h2 className="font-display text-3xl leading-tight text-balance md:text-4xl">
          Sua próxima joia ainda é surpresa.
        </h2>
        <a
          href="#escolher"
          className="mt-8 inline-flex w-full items-center justify-center rounded-sm bg-primary px-8 py-4 text-sm font-semibold tracking-[0.16em] text-primary-foreground uppercase transition-colors hover:bg-sage sm:w-auto"
        >
          Quero meu Scoop
        </a>
      </div>
    </section>
  );
}
