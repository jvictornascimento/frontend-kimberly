import pattern from "@/assets/belyeve-pattern-gold.png.asset.json";
import { MEDIA } from "@/data/media";
import { MediaImage } from "./MediaImage";
import { Reveal } from "./Reveal";

function Flower() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7 text-gold motion-safe:animate-[float_4s_ease-in-out_infinite]"
      aria-hidden
    >
      {[0, 72, 144, 216, 288].map((r) => (
        <ellipse
          key={r}
          cx="12"
          cy="6.5"
          rx="3.4"
          ry="5"
          fill="currentColor"
          opacity="0.85"
          transform={`rotate(${r} 12 12)`}
        />
      ))}
      <circle cx="12" cy="12" r="2.4" className="fill-cream" />
    </svg>
  );
}

function Ball() {
  return (
    <span
      aria-hidden
      className="block h-6 w-6 rounded-full bg-gold ring-4 ring-gold/20 motion-safe:animate-[float_4s_ease-in-out_1s_infinite]"
    />
  );
}

export function Fishing() {
  return (
    <section id="pesca" className="relative overflow-hidden bg-cream px-5 py-16 sm:px-8 md:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: `url(${pattern.url})`, backgroundSize: "240px" }}
      />
      <div className="relative mx-auto max-w-5xl">
        <Reveal className="text-center">
          <p className="eyebrow">A parte divertida</p>
          <h2 className="font-display mt-3 text-4xl leading-tight sm:text-5xl">
            A magia está na pesca ✨
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Dentro do Scoop, cada elemento representa um pacotinho. Veja o que cada um significa.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-10 sm:grid-cols-2 sm:gap-8">
          <Reveal className="flex gap-5">
            <div className="shrink-0 pt-1">
              <Flower />
            </div>
            <div>
              <h3 className="font-display text-2xl">Florzinha</h3>
              <p className="mt-1 text-sm font-semibold">Um pacotinho de joia</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                A joia segue a categoria que você escolheu: Dourado, ou Prata, Prata 925 e inox.
              </p>
            </div>
          </Reveal>
          <Reveal delay={120} className="flex gap-5">
            <div className="shrink-0 pt-1.5">
              <Ball />
            </div>
            <div>
              <h3 className="font-display text-2xl">Bolinha dourada</h3>
              <p className="mt-1 text-sm font-semibold">Um brinde surpresa</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Os brindes variam entre diferentes tipos de produtos, como itens de beleza e
                acessórios.
              </p>
            </div>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-5 gap-3 sm:gap-5">
          <Reveal className="col-span-3">
            <MediaImage item={MEDIA.packets} ratio="1/1" className="h-full" />
          </Reveal>
          <Reveal delay={120} className="col-span-2">
            <MediaImage item={MEDIA.gifts} ratio="2/3" className="h-full w-full" />
          </Reveal>
        </div>

        <Reveal className="mx-auto mt-14 max-w-xl border-y border-gold/50 py-8 text-center">
          <p className="eyebrow">Pacotinhos extras</p>
          <p className="mt-3 text-sm leading-relaxed">
            Alguns pacotinhos podem trazer um pacote ou brinde a mais para o seu pedido. Isso não é
            garantido, é parte da descoberta.
          </p>
          <p className="font-display mt-4 text-2xl leading-snug text-balance">
            Seu Scoop sempre tem o mínimo garantido. O restante faz parte da surpresa.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
