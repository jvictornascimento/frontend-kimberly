import { useRef, useState } from "react";
import { Section } from "./Section";
import { LaunchCountdown } from "./LaunchCountdown";
import { cn } from "@/lib/utils";
import {
  EMPTY_ORDER,
  METAL_CATEGORIES,
  SCOOP_OPTIONS,
  formatPrice,
  guaranteeFor,
  pricingFor,
  type MetalCategory,
  type ScoopOption,
  type ScoopOrderDraft,
} from "@/data/scoops";

interface Contact {
  name: string;
  whatsapp: string;
  email: string;
  cep: string;
}

const EMPTY_CONTACT: Contact = { name: "", whatsapp: "", email: "", cep: "" };

export function ScoopSelector() {
  const [order, setOrder] = useState<ScoopOrderDraft>(EMPTY_ORDER);
  const [picked, setPicked] = useState(false);
  const [contact, setContact] = useState<Contact>(EMPTY_CONTACT);
  const [sent, setSent] = useState(false);
  const detailsRef = useRef<HTMLDivElement>(null);

  function update(patch: Partial<ScoopOrderDraft>) {
    setOrder((prev) => ({ ...prev, ...patch }));
  }

  function choose(option: ScoopOption) {
    update({ quantity: option.quantity });
    setPicked(true);
    setSent(false);
    requestAnimationFrame(() => detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  const guarantee = guaranteeFor(order.quantity);
  const contactOk =
    contact.name.trim().length > 1 &&
    contact.whatsapp.replace(/\D/g, "").length >= 10 &&
    /\S+@\S+\.\S+/.test(contact.email) &&
    contact.cep.replace(/\D/g, "").length === 8;
  const ready = order.metal !== null && order.wearsRings !== null && contactOk;

  return (
    <Section
      id="escolher"
      tone="white"
      eyebrow="Escolha seu pacote"
      title="Quantos Scoops você quer?"
      intro={`Cada Scoop garante no mínimo 2 joias + 3 brindes surpresa.`}
    >
      <LaunchCountdown className="mb-6" />

      <div className="grid gap-4 sm:grid-cols-3">
        {SCOOP_OPTIONS.map((option) => (
          <ScoopCard
            key={option.id}
            option={option}
            active={picked && order.quantity === option.quantity}
            onChoose={() => choose(option)}
          />
        ))}
      </div>

      {picked && (
        <div ref={detailsRef} className="mt-12 scroll-mt-20 border-t border-border pt-8">
          <p className="eyebrow">Seu pedido</p>
          <p className="font-display mt-2 text-3xl">
            {order.quantity} {order.quantity === 1 ? "Scoop" : "Scoops"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Mínimo garantido: {guarantee.jewelry} joias + {guarantee.gifts} brindes surpresa.{" "}
            <button type="button" onClick={() => setPicked(false)} className="underline underline-offset-4">
              Trocar
            </button>
          </p>

          <fieldset className="mt-8">
            <legend className="eyebrow">Categoria das joias</legend>
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
          </fieldset>

          <fieldset className="mt-8">
            <legend className="eyebrow">Anéis</legend>
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
                    order.wearsRings === opt.value ? "border-gold bg-secondary/50" : "border-border hover:border-sage",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {order.wearsRings && (
              <Field
                label="Número do anel (opcional)"
                value={order.ringSize ?? ""}
                onChange={(v) => update({ ringSize: v })}
                inputMode="numeric"
                placeholder="Ex.: 16"
              />
            )}
          </fieldset>

          <fieldset className="mt-8">
            <legend className="eyebrow">Seus dados</legend>
            <Field label="Nome completo" value={contact.name} onChange={(v) => setContact({ ...contact, name: v })} autoComplete="name" />
            <Field label="WhatsApp" value={contact.whatsapp} onChange={(v) => setContact({ ...contact, whatsapp: v })} inputMode="tel" autoComplete="tel" placeholder="(00) 00000-0000" />
            <Field label="E-mail" value={contact.email} onChange={(v) => setContact({ ...contact, email: v })} inputMode="email" autoComplete="email" />
            <Field label="CEP" value={contact.cep} onChange={(v) => setContact({ ...contact, cep: v })} inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" />
          </fieldset>

          <button
            type="button"
            disabled={!ready}
            onClick={() => setSent(true)}
            className="mt-8 w-full rounded-sm bg-primary px-8 py-4 text-sm font-semibold tracking-[0.16em] text-primary-foreground uppercase transition-colors hover:bg-sage disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
          >
            Continuar para pagamento
          </button>
          {!ready && !sent && (
            <p className="mt-2 text-xs text-muted-foreground">Preencha categoria, anéis e seus dados para continuar.</p>
          )}
          {sent && (
            <p className="mt-3 border-l-2 border-gold pl-3 text-sm" role="status">
              Dados recebidos. O pagamento online estará disponível em breve.
            </p>
          )}
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
        <span className="text-xs text-muted-foreground">
          {g.jewelry + g.gifts}+ itens
        </span>
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

function Field({
  label,
  value,
  onChange,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className="mt-3 block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-sm border border-input bg-background px-4 py-3 text-base outline-none focus:border-sage"
      />
    </label>
  );
}
