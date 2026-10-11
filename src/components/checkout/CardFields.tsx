import { maskCardNumber, maskExpiry, onlyDigits } from "@/features/checkout/domain/masks";
import { validateCard } from "@/features/checkout/domain/validation";
import type { CardFormData } from "@/features/checkout/types";
import { TextField } from "./ui";

export function CardFields({
  card,
  onChange,
  touched = false,
}: {
  card: CardFormData;
  onChange: (card: CardFormData) => void;
  touched?: boolean;
}) {
  const errors = validateCard(card);
  const update = (patch: Partial<CardFormData>) => onChange({ ...card, ...patch });
  const error = (field: keyof CardFormData) => (touched ? errors[field] : undefined);

  return (
    <div className="grid grid-cols-2 gap-4">
      <TextField
        id="cc-number"
        className="col-span-2"
        label="Número do cartão"
        value={card.number}
        onChange={(value) => update({ number: maskCardNumber(value) })}
        error={error("number")}
        inputMode="numeric"
        autoComplete="cc-number"
      />
      <TextField
        id="cc-name"
        className="col-span-2"
        label="Nome impresso no cartão"
        value={card.holderName}
        onChange={(holderName) => update({ holderName })}
        error={error("holderName")}
        autoComplete="cc-name"
        maxLength={60}
      />
      <TextField
        id="cc-exp"
        label="Validade"
        value={card.expiry}
        onChange={(value) => update({ expiry: maskExpiry(value) })}
        error={error("expiry")}
        inputMode="numeric"
        autoComplete="cc-exp"
        placeholder="MM/AA"
      />
      <TextField
        id="cc-csc"
        label="CVV"
        value={card.cvv}
        onChange={(value) => update({ cvv: onlyDigits(value).slice(0, 4) })}
        error={error("cvv")}
        inputMode="numeric"
        autoComplete="cc-csc"
      />
    </div>
  );
}
