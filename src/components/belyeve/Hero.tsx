import pattern from "@/assets/belyeve-pattern-sage.png.asset.json";
import { GoldRule } from "./Section";
import { GUARANTEE_PER_SCOOP } from "@/data/scoops";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden px-5 pt-14 pb-16 sm:px-8 md:pt-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: `url(${pattern.url})`, backgroundSize: "260px" }}
      />
      <div className="relative mx-auto max-w-3xl">
        <p className="eyebrow">Scoop Surpresa</p>
        <h1 className="font-display mt-4 text-[2.6rem] leading-[1.05] text-balance sm:text-6xl">
          A surpresa que você abre com as próprias mãos.
        </h1>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
          Cada Scoop garante no mínimo {GUARANTEE_PER_SCOOP.jewelry} joias e{" "}
          {GUARANTEE_PER_SCOOP.gifts} brindes surpresa. O que aparece na pesca é a parte que ninguém
          sabe antes.
        </p>

        <a
          href="#escolher"
          className="mt-8 inline-flex w-full items-center justify-center rounded-sm bg-primary px-8 py-4 text-sm font-semibold tracking-[0.16em] text-primary-foreground uppercase transition-colors hover:bg-sage sm:w-auto"
        >
          Quero meu Scoop
        </a>

        <GoldRule className="mt-12" />
        <ul className="mt-6 grid gap-3 text-xs tracking-wide text-muted-foreground sm:grid-cols-3 sm:text-sm">
          <li>Mínimo garantido em todo Scoop</li>
          <li>Você escolhe Dourado ou Prata</li>
          <li>Itens extras da pesca são seus</li>
        </ul>
      </div>
    </section>
  );
}
