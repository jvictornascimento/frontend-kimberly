import { useState } from "react";
import { Section } from "./Section";
import { cn } from "@/lib/utils";
import {
  EMPTY_ORDER,
  METAL_CATEGORIES,
  SCOOP_OPTIONS,
  formatPrice,
  guaranteeFor,
  type MetalCategory,
  type ScoopOrderDraft,
} from "@/data/scoops";

export function ScoopSelector() {
  const [order, setOrder] = useState<ScoopOrderDraft>(EMPTY_ORDER);
  const guarantee = guaranteeFor(order.quantity);
  const ready = order.metal !== null && order.wearsRings !== null;

  function update(patch: Partial<ScoopOrderDraft>) {
    setOrder((prev) => ({ ...prev, ...patch }));
  }

  return (
    <Section
      id="escolher"
      tone="white"
      eyebrow="Passo 1"
      title="Quantos Scoops você quer?"
      intro="Cada Scoop é uma experiência completa, com mínimo garantido."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {SCOOP_OPTIONS.map((option) => {
          const active = order.quantity === option.quantity;
          const price = formatPrice(option.priceCents);
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => update({ quantity: option.quantity })}
              aria-pressed={active}
              className={cn(
                "rounded-sm border px-5 py-5 text-left transition-colors",
                active ? "border-gold bg-secondary/50" : "border-border hover:border-sage",
              )}
            >
              <span className="font-display block text-2xl">{option.label}</span>
              <span className="mt-2 block text-xs text-muted-foreground">
                {guaranteeFor(option.quantity).jewelry} joias +{" "}
                {guaranteeFor(option.quantity).gifts} brindes garantidos
              </span>
              <span className="mt-3 block text-sm font-medium">
                {price ?? <span className="text-muted-foreground">Valor em breve</span>}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-10">
        <p className="eyebrow">Passo 2 — Categoria</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {METAL_CATEGORIES.map((c) => {
            const active = order.metal === c.value;
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => update({ metal: c.value as MetalCategory })}
                aria-pressed={active}
                className={cn(
                  "rounded-sm border px-5 py-4 text-left transition-colors",
                  active ? "border-gold bg-secondary/50" : "border-border hover:border-sage",
                )}
              >
                <span className="block text-sm font-semibold">{c.label}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{c.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-10">
        <p className="eyebrow">Passo 3 — Anéis</p>
        <div className="mt-3 flex gap-3">
          {[
            { label: "Uso anéis", value: true },
            { label: "Não uso anéis", value: false },
          ].map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => update({ wearsRings: opt.value, ringSize: null })}
              aria-pressed={order.wearsRings === opt.value}
              className={cn(
                "flex-1 rounded-sm border px-4 py-3 text-sm transition-colors",
                order.wearsRings === opt.value
                  ? "border-gold bg-secondary/50"
                  : "border-border hover:border-sage",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {order.wearsRings && (
          <label className="mt-3 block">
            <span className="text-xs text-muted-foreground">Número do anel (opcional)</span>
            <input
              inputMode="numeric"
              value={order.ringSize ?? ""}
              onChange={(e) => update({ ringSize: e.target.value })}
              className="mt-1 w-full rounded-sm border border-input bg-background px-4 py-3 text-sm outline-none focus:border-sage"
              placeholder="Ex.: 16"
            />
          </label>
        )}
      </div>

      <div className="mt-10 border-t border-border pt-6">
        <p className="text-sm text-muted-foreground">
          Garantido no seu pedido: {guarantee.jewelry} joias + {guarantee.gifts} brindes surpresa.
        </p>
        <button
          type="button"
          disabled={!ready}
          className="mt-4 w-full rounded-sm bg-primary px-8 py-4 text-sm font-semibold tracking-[0.16em] text-primary-foreground uppercase transition-colors hover:bg-sage disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
        >
          Quero meu Scoop
        </button>
        {!ready && (
          <p className="mt-2 text-xs text-muted-foreground">
            Escolha a categoria e informe sobre os anéis para continuar.
          </p>
        )}
      </div>
    </Section>
  );
}
