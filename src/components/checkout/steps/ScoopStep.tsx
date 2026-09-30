import { useState } from "react";
import { SCOOP_OPTIONS, guaranteeFor, pricingFor } from "@/data/scoops";
import { ChoiceRadio } from "@/components/belyeve/ChoiceRadio";
import { PreferencesFields } from "@/components/belyeve/PreferencesFields";
import { preferencesError } from "@/features/checkout/domain/validation";
import { goToStep, updateSelection } from "@/features/checkout/state/checkout.store";
import type { ScoopSelection } from "@/features/checkout/types";
import { PrimaryButton, StepHeader } from "../ui";
import { priceOr } from "../format";

export function ScoopStep({ selection }: { selection: ScoopSelection }) {
  const [tried, setTried] = useState(false);
  const error = preferencesError(selection);

  return (
    <div>
      <StepHeader
        title="Seu Scoop"
        description="Confira o pacote e suas preferências. O conteúdo continua sendo surpresa."
      />
      <fieldset className="mt-6">
        <legend className="text-sm font-semibold">Quantidade</legend>
        <div className="mt-3 grid gap-3">
          {SCOOP_OPTIONS.map((o) => {
            const g = guaranteeFor(o.quantity);
            return (
              <ChoiceRadio
                key={o.id}
                name="quantity"
                checked={selection.quantity === o.quantity}
                onSelect={() => updateSelection({ quantity: o.quantity })}
                title={o.label}
                description={`Mínimo de ${g.jewelry} joias + ${g.gifts} brindes surpresa`}
                aside={priceOr(pricingFor(o).total, "Valor em breve")}
              />
            );
          })}
        </div>
      </fieldset>

      <PreferencesFields value={selection} onChange={updateSelection} />

      <PrimaryButton
        className="mt-8"
        onClick={() => {
          setTried(true);
          if (!error) goToStep("customer");
        }}
      >
        Continuar
      </PrimaryButton>
      {tried && error && (
        <p role="alert" className="mt-2 text-center text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
