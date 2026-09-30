import { useState } from "react";
import { maskCardNumber, maskExpiry, onlyDigits } from "@/features/checkout/domain/masks";
import { hasErrors, validateCard } from "@/features/checkout/domain/validation";
import { usePayWithCard } from "@/features/checkout/hooks/useOrderActions";
import { useTouched } from "@/features/checkout/hooks/useTouched";
import type { CardFormData, PlacedOrder } from "@/features/checkout/types";
import { Notice, PrimaryButton, TextField } from "./ui";

const EMPTY_CARD: CardFormData = { number: "", holderName: "", expiry: "", cvv: "" };

/** Card data stays in this component's memory only. Never persisted or logged. */
export function CardForm({ placed }: { placed: PlacedOrder }) {
  const [card, setCard] = useState<CardFormData>(EMPTY_CARD);
  const errors = validateCard(card);
  const { touch, visible, submit } = useTouched<keyof CardFormData>();
  const { status, pay } = usePayWithCard(placed);
  const err = (f: keyof CardFormData) => (visible(f) ? errors[f] : undefined);
  const set = (patch: Partial<CardFormData>) => setCard((c) => ({ ...c, ...patch }));
  const pending = status === "pending";

  return (
    <form
      noValidate
      autoComplete="on"
      className="mt-8 border border-border bg-card px-5 py-5"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
        if (!hasErrors(errors)) void pay(card);
      }}
    >
      <h2 className="text-sm font-semibold">Dados do cartão</h2>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <TextField
          id="cc-number"
          className="col-span-2"
          label="Número do cartão"
          value={card.number}
          onChange={(v) => set({ number: maskCardNumber(v) })}
          onBlur={() => touch("number")}
          error={err("number")}
          inputMode="numeric"
          autoComplete="cc-number"
        />
        <TextField
          id="cc-name"
          className="col-span-2"
          label="Nome impresso no cartão"
          value={card.holderName}
          onChange={(v) => set({ holderName: v })}
          onBlur={() => touch("holderName")}
          error={err("holderName")}
          autoComplete="cc-name"
          maxLength={60}
        />
        <TextField
          id="cc-exp"
          label="Validade"
          value={card.expiry}
          onChange={(v) => set({ expiry: maskExpiry(v) })}
          onBlur={() => touch("expiry")}
          error={err("expiry")}
          inputMode="numeric"
          autoComplete="cc-exp"
          placeholder="MM/AA"
        />
        <TextField
          id="cc-csc"
          label="CVV"
          value={card.cvv}
          onChange={(v) => set({ cvv: onlyDigits(v).slice(0, 4) })}
          onBlur={() => touch("cvv")}
          error={err("cvv")}
          inputMode="numeric"
          autoComplete="cc-csc"
        />
      </div>
      {status === "error" && (
        <div className="mt-4">
          <Notice tone="error" role="alert">
            Não conseguimos enviar o pagamento. Confira os dados do cartão e tente novamente.
          </Notice>
        </div>
      )}
      <PrimaryButton type="submit" className="mt-6" disabled={pending} aria-busy={pending}>
        {pending ? "Enviando…" : "Pagar com cartão"}
      </PrimaryButton>
    </form>
  );
}
