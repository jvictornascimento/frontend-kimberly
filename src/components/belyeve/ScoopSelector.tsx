import { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Section } from "./Section";
import { LaunchCountdown } from "./LaunchCountdown";
import { PreferencesFields } from "./PreferencesFields";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";
import { SCOOP_OPTIONS, formatPrice, guaranteeFor, pricingFor, type ScoopOption } from "@/data/scoops";
import { findPackage } from "@/features/checkout/domain/pricing";
import { preferencesError } from "@/features/checkout/domain/validation";
import { setCheckout, updateSelection, useCheckout } from "@/features/checkout/state/checkout.store";

export function ScoopSelector() {
  const { selection } = useCheckout();
  const navigate = useNavigate();
  const [picked, setPicked] = useState(false);
  const [tried, setTried] = useState(false);
  const detailsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  // Trocar a quantidade preserva tudo o que já foi preenchido.
  function choose(option: ScoopOption) {
    updateSelection({ quantity: option.quantity });
    track("select_scoop", { quantity: option.quantity });
    setPicked(true);
    requestAnimationFrame(() => detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  const guarantee = guaranteeFor(selection.quantity);
  const selected = findPackage(selection.quantity);
  const selectedTotal = formatPrice(pricingFor(selected).total);
  const error = preferencesError(selection);

  function goToCheckout() {
    setTried(true);
    if (error) return;
    track("begin_checkout", { quantity: selection.quantity });
    setCheckout({ step: "customer" });
    navigate({ to: "/checkout" });
  }

  return (
    <Section
      id="escolher"
      tone="white"
      eyebrow="Escolha seu pacote"
      title="Quantos Scoops você quer?"
      intro="Cada Scoop garante no mínimo 2 joias + 3 brindes surpresa."
    >
      <LaunchCountdown className="mb-6" />

      <div ref={cardsRef} className="grid scroll-mt-20 gap-4 sm:grid-cols-3">
        {SCOOP_OPTIONS.map((option) => (
          <ScoopCard
            key={option.id}
            option={option}
            active={picked && selection.quantity === option.quantity}
            onChoose={() => choose(option)}
          />
        ))}
      </div>

      {picked && (
        <div ref={detailsRef} className="mt-12 scroll-mt-20 border-t border-border pt-8">
          <div className="flex items-center justify-between gap-4 border border-gold/60 bg-secondary/40 px-4 py-3">
            <div>
              <p className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">Seu Scoop</p>
              <p className="font-display text-2xl leading-tight">
                {selected.label}
                {selectedTotal && <span className="ml-2 font-sans text-sm font-medium">{selectedTotal}</span>}
              </p>
              <p className="text-xs text-muted-foreground">
                Mínimo de {guarantee.jewelry} joias + {guarantee.gifts} brindes surpresa
              </p>
            </div>
            <button
              type="button"
              onClick={() => cardsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="shrink-0 text-xs font-medium underline underline-offset-4"
            >
              Alterar
            </button>
          </div>

          <div className="animate-in fade-in duration-300">
            <h3 className="font-display mt-8 text-3xl leading-tight">Conte um pouquinho sobre você</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Assim preparamos o seu Scoop com carinho. O conteúdo continua sendo surpresa.
            </p>

            <PreferencesFields value={selection} onChange={updateSelection} />

            <button
              type="button"
              onClick={goToCheckout}
              className="mt-8 w-full rounded-sm bg-primary px-8 py-4 text-sm font-semibold tracking-[0.16em] text-primary-foreground uppercase transition-colors hover:bg-sage"
            >
              Continuar
            </button>
            {tried && error && (
              <p className="mt-2 text-center text-xs text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>
      )}
    </Section>
  );
}

function ScoopCard({ option, active, onChoose }: { option: ScoopOption; active: boolean; onChoose: () => void }) {
  const p = pricingFor(option);
  const g = guaranteeFor(option.quantity);
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-sm border bg-background px-5 pt-6 pb-5",
        active ? "border-gold ring-1 ring-gold" : option.highlighted ? "border-sage" : "border-border",
      )}
    >
      {option.badge && (
        <span
          className={cn(
            "absolute -top-3 left-5 rounded-sm px-2.5 py-1 text-[10px] font-semibold tracking-[0.16em]",
            option.highlighted ? "bg-primary text-primary-foreground" : "bg-gold text-cream",
          )}
        >
          {option.badge}
        </span>
      )}

      <div className="flex items-baseline justify-between gap-3">
        <span className="font-display text-3xl leading-none">{option.label}</span>
        <span className="text-xs text-muted-foreground">{g.jewelry + g.gifts}+ itens</span>
      </div>

      <div className="mt-4 min-h-16">
        {p.total == null ? (
          <p className="text-sm text-muted-foreground">Valor em breve</p>
        ) : (
          <>
            {p.previous != null && (
              <p className="text-xs text-muted-foreground line-through">de {formatPrice(p.previous)}</p>
            )}
            <p className="text-2xl font-semibold tabular-nums">{formatPrice(p.total)}</p>
            {p.installment && (
              <p className="text-xs text-muted-foreground">
                ou {p.installment.count}x de {formatPrice(p.installment.value)}
              </p>
            )}
          </>
        )}
      </div>

      {(p.perScoop != null || p.savings != null) && (
        <p className="mt-2 flex flex-wrap gap-x-3 text-xs">
          {option.quantity > 1 && p.perScoop != null && <span>{formatPrice(p.perScoop)} por Scoop</span>}
          {p.savings != null && p.savings > 0 && (
            <span className="font-semibold text-sage-deep">Economize {formatPrice(p.savings)}</span>
          )}
        </p>
      )}

      <button
        type="button"
        onClick={onChoose}
        aria-pressed={active}
        className={cn(
          "mt-5 w-full rounded-sm px-4 py-3.5 text-xs font-semibold tracking-[0.16em] uppercase transition-colors",
          option.highlighted || active
            ? "bg-primary text-primary-foreground hover:bg-sage"
            : "border border-primary text-primary hover:bg-secondary/60",
        )}
      >
        {active ? "Selecionado" : "Quero meu Scoop"}
      </button>
    </div>
  );
}
