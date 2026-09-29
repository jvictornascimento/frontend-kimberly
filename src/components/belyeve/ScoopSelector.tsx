import { useRef, useState } from "react";
import { Section } from "./Section";
import { LaunchCountdown } from "./LaunchCountdown";
import { cn } from "@/lib/utils";
import {
  EMPTY_ORDER,
  METAL_CATEGORIES,
  RING_SIZES,
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

type Step = "about" | "contact";

export function ScoopSelector() {
  const [order, setOrder] = useState<ScoopOrderDraft>(EMPTY_ORDER);
  const [picked, setPicked] = useState(false);
  const [step, setStep] = useState<Step>("about");
  const [contact, setContact] = useState<Contact>(EMPTY_CONTACT);
  const [sent, setSent] = useState(false);
  const detailsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  function update(patch: Partial<ScoopOrderDraft>) {
    setOrder((prev) => ({ ...prev, ...patch }));
  }

  function scrollToDetails() {
    requestAnimationFrame(() => detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  // Trocar a quantidade preserva tudo o que já foi preenchido.
  function choose(option: ScoopOption) {
    update({ quantity: option.quantity });
    setPicked(true);
    setSent(false);
    scrollToDetails();
  }

  const guarantee = guaranteeFor(order.quantity);
  const selected = SCOOP_OPTIONS.find((o) => o.quantity === order.quantity)!;
  const selectedTotal = formatPrice(pricingFor(selected).total);
  const ringsOk = order.wearsRings === false || (order.wearsRings === true && !!order.ringSize?.trim());
  const aboutOk = order.metal !== null && ringsOk;
  const contactOk =
    contact.name.trim().length > 1 &&
    contact.whatsapp.replace(/\D/g, "").length >= 10 &&
    /\S+@\S+\.\S+/.test(contact.email) &&
    contact.cep.replace(/\D/g, "").length === 8;

  return (
    <Section
      id="escolher"
      tone="white"
      eyebrow="Escolha seu pacote"
      title="Quantos Scoops você quer?"
      intro={`Cada Scoop garante no mínimo 2 joias + 3 brindes surpresa.`}
    >
      <LaunchCountdown className="mb-6" />

      <div ref={cardsRef} className="grid scroll-mt-20 gap-4 sm:grid-cols-3">
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
          {/* Resumo do Scoop selecionado */}
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

          {step === "about" ? (
            <div className="animate-in fade-in duration-300">
              <h3 className="font-display mt-8 text-3xl leading-tight">Conte um pouquinho sobre você</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Assim preparamos o seu Scoop com carinho. O conteúdo continua sendo surpresa.
              </p>

              <fieldset className="mt-8">
                <legend className="text-sm font-semibold">Qual categoria você prefere?</legend>
                <div role="radiogroup" className="mt-3 grid gap-3 sm:grid-cols-2">
                  {METAL_CATEGORIES.map((c) => (
                    <ChoiceRadio
                      key={c.value}
                      name="metal"
                      checked={order.metal === c.value}
                      onSelect={() => update({ metal: c.value as MetalCategory })}
                      title={c.label}
                      description={c.description}
                    />
                  ))}
                </div>
              </fieldset>

              <fieldset className="mt-8">
                <legend className="text-sm font-semibold">Você usa anéis?</legend>
                <div role="radiogroup" className="mt-3 grid grid-cols-2 gap-3">
                  {[
                    { label: "Sim", value: true },
                    { label: "Não", value: false },
                  ].map((opt) => (
                    <ChoiceRadio
                      key={opt.label}
                      name="rings"
                      checked={order.wearsRings === opt.value}
                      onSelect={() => update({ wearsRings: opt.value, ringSize: opt.value ? order.ringSize : null })}
                      title={opt.label}
                      center
                    />
                  ))}
                </div>

                <div
                  className={cn(
                    "grid transition-all duration-300 ease-out",
                    order.wearsRings ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                  )}
                  aria-hidden={!order.wearsRings}
                >
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold">Qual o tamanho do seu anel?</p>
                    {RING_SIZES.length > 0 ? (
                      <div role="radiogroup" className="mt-3 flex flex-wrap gap-2">
                        {RING_SIZES.map((size) => (
                          <button
                            key={size}
                            type="button"
                            role="radio"
                            aria-checked={order.ringSize === size}
                            tabIndex={order.wearsRings ? 0 : -1}
                            onClick={() => update({ ringSize: size })}
                            className={cn(
                              "h-11 min-w-11 rounded-sm border px-3 text-sm transition-colors",
                              order.ringSize === size ? "border-gold bg-secondary/60 font-semibold" : "border-border",
                            )}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <input
                        inputMode="numeric"
                        maxLength={4}
                        tabIndex={order.wearsRings ? 0 : -1}
                        value={order.ringSize ?? ""}
                        onChange={(e) => update({ ringSize: e.target.value.replace(/[^\d]/g, "") })}
                        placeholder="Ex.: 16"
                        aria-label="Tamanho do anel"
                        className="mt-2 w-32 rounded-sm border border-input bg-background px-4 py-3 text-base outline-none focus:border-sage"
                      />
                    )}
                  </div>
                </div>
              </fieldset>

              <label className="mt-8 block">
                <span className="text-sm font-semibold">Tem algum tipo de peça que você não usa?</span>
                <span className="ml-1 text-xs text-muted-foreground">(opcional)</span>
                <textarea
                  rows={2}
                  maxLength={200}
                  value={order.avoidNote}
                  onChange={(e) => update({ avoidNote: e.target.value })}
                  placeholder="Ex.: não uso pulseiras."
                  className="mt-2 w-full resize-none rounded-sm border border-input bg-background px-4 py-3 text-base outline-none focus:border-sage"
                />
              </label>

              <button
                type="button"
                disabled={!aboutOk}
                onClick={() => {
                  setStep("contact");
                  scrollToDetails();
                }}
                className="mt-8 w-full rounded-sm bg-primary px-8 py-4 text-sm font-semibold tracking-[0.16em] text-primary-foreground uppercase transition-colors hover:bg-sage disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
              >
                Continuar
              </button>
              {!aboutOk && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  {order.metal === null
                    ? "Escolha a categoria para continuar."
                    : order.wearsRings === null
                      ? "Conte se você usa anéis para continuar."
                      : "Informe o tamanho do seu anel para continuar."}
                </p>
              )}
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              <button
                type="button"
                onClick={() => {
                  setStep("about");
                  scrollToDetails();
                }}
                className="mt-6 text-xs underline underline-offset-4"
              >
                ← Voltar
              </button>
              <h3 className="font-display mt-4 text-3xl leading-tight">Para onde enviamos?</h3>
              <Field label="Nome completo" value={contact.name} onChange={(v) => setContact({ ...contact, name: v })} autoComplete="name" maxLength={100} />
              <Field label="WhatsApp" value={contact.whatsapp} onChange={(v) => setContact({ ...contact, whatsapp: v })} inputMode="tel" autoComplete="tel" placeholder="(00) 00000-0000" maxLength={20} />
              <Field label="E-mail" value={contact.email} onChange={(v) => setContact({ ...contact, email: v })} inputMode="email" autoComplete="email" maxLength={255} />
              <Field label="CEP" value={contact.cep} onChange={(v) => setContact({ ...contact, cep: v })} inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" maxLength={9} />

              <button
                type="button"
                disabled={!contactOk}
                onClick={() => setSent(true)}
                className="mt-8 w-full rounded-sm bg-primary px-8 py-4 text-sm font-semibold tracking-[0.16em] text-primary-foreground uppercase transition-colors hover:bg-sage disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
              >
                Continuar para pagamento
              </button>
              {sent && (
                <p className="mt-3 border-l-2 border-gold pl-3 text-sm" role="status">
                  Dados recebidos. O pagamento online estará disponível em breve.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </Section>
  );
}

function ChoiceRadio({
  name,
  checked,
  onSelect,
  title,
  description,
  center,
}: {
  name: string;
  checked: boolean;
  onSelect: () => void;
  title: string;
  description?: string;
  center?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-sm border px-4 py-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sage",
        checked ? "border-gold bg-secondary/50" : "border-border hover:border-sage",
        center && "items-center justify-center",
      )}
    >
      <input type="radio" name={name} checked={checked} onChange={onSelect} className="sr-only" />
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
          checked ? "border-gold" : "border-muted-foreground/50",
          center && "mt-0",
        )}
      >
        {checked && <span className="h-2 w-2 rounded-full bg-gold" />}
      </span>
      <span>
        <span className="block text-sm font-semibold tracking-[0.12em] uppercase">{title}</span>
        {description && <span className="mt-1 block text-xs text-muted-foreground">{description}</span>}
      </span>
    </label>
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
