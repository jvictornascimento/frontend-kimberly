import { useEffect, useState } from "react";
import { maskCep } from "@/features/checkout/domain/masks";
import { BR_STATES, hasErrors, validateAddress } from "@/features/checkout/domain/validation";
import { useShippingQuote } from "@/features/checkout/hooks/useShippingQuote";
import { useTouched } from "@/features/checkout/hooks/useTouched";
import { useZipLookup } from "@/features/checkout/hooks/useZipLookup";
import { goToStep, setCheckout, updateAddress } from "@/features/checkout/state/checkout.store";
import type { Address, AddressLookup, CheckoutState } from "@/features/checkout/types";
import { cn } from "@/lib/utils";
import { ShippingOptions } from "../ShippingOptions";
import { PrimaryButton, StepHeader, TextButton, TextField } from "../ui";

const ZIP_MESSAGES = {
  idle: undefined,
  loading: "Buscando endereço…",
  found: "Endereço encontrado. Confira e complete os dados.",
  not_found: "Não encontramos este CEP. Preencha o endereço abaixo.",
  error: "Não conseguimos buscar o CEP agora. Preencha o endereço abaixo.",
} as const;

export function DeliveryStep({ state }: { state: CheckoutState }) {
  const { address, shipping, selection } = state;
  const [initialCity] = useState(address.city);
  const errors = validateAddress(address);
  const { touch, visible, submit } = useTouched<keyof Address | "shipping">();
  const err = (f: keyof Address) => (visible(f) ? errors[f] : undefined);

  const zipStatus = useZipLookup(
    address.zipCode,
    (found: AddressLookup) =>
      updateAddress({
        street: found.street || address.street,
        district: found.district || address.district,
        city: found.city || address.city,
        state: found.state || address.state,
      }),
    initialCity !== "",
  );

  const quote = useShippingQuote({ ...address, quantity: selection.quantity });

  // Keep the selected option consistent with the latest quote; Pedreira is auto-selected.
  useEffect(() => {
    if (quote.state.status === "loading") return;
    const options = quote.state.status === "success" ? quote.state.data : [];
    const local = options.find((o) => o.kind === "local_delivery");
    if (local) {
      if (shipping?.id !== local.id) setCheckout({ shipping: local });
    } else if (shipping && !options.some((o) => o.id === shipping.id)) {
      setCheckout({ shipping: null });
    }
  }, [quote.state, shipping]);

  const canContinue =
    !hasErrors(errors) &&
    quote.state.status === "success" &&
    shipping !== null &&
    quote.state.data.some((option) => option.id === shipping.id);

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit();
        if (canContinue) goToStep("payment");
      }}
    >
      <TextButton onClick={() => goToStep("customer")}>← Voltar</TextButton>
      <div className="mt-4">
        <StepHeader title="Entrega" description="Para onde enviamos o seu Scoop?" />
      </div>

      <div className="mt-6 grid grid-cols-6 gap-4">
        <TextField
          id="zipCode"
          className="col-span-6 sm:col-span-3"
          label="CEP"
          value={address.zipCode}
          onChange={(v) => updateAddress({ zipCode: maskCep(v) })}
          onBlur={() => touch("zipCode")}
          error={err("zipCode")}
          hint={ZIP_MESSAGES[zipStatus]}
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="00000-000"
        />
        <TextField
          id="street"
          className="col-span-6"
          label="Rua"
          value={address.street}
          onChange={(v) => updateAddress({ street: v })}
          onBlur={() => touch("street")}
          error={err("street")}
          autoComplete="address-line1"
          maxLength={120}
        />
        <TextField
          id="number"
          className="col-span-2"
          label="Número"
          value={address.number}
          onChange={(v) => updateAddress({ number: v })}
          onBlur={() => touch("number")}
          error={err("number")}
          maxLength={10}
        />
        <TextField
          id="complement"
          className="col-span-4"
          label="Complemento"
          optional
          value={address.complement}
          onChange={(v) => updateAddress({ complement: v })}
          autoComplete="address-line2"
          maxLength={60}
        />
        <TextField
          id="district"
          className="col-span-6"
          label="Bairro"
          value={address.district}
          onChange={(v) => updateAddress({ district: v })}
          onBlur={() => touch("district")}
          error={err("district")}
          maxLength={80}
        />
        <TextField
          id="city"
          className="col-span-4"
          label="Cidade"
          value={address.city}
          onChange={(v) => updateAddress({ city: v })}
          onBlur={() => touch("city")}
          error={err("city")}
          autoComplete="address-level2"
          maxLength={80}
        />
        <div className="col-span-2">
          <label htmlFor="state" className="text-xs font-medium">
            Estado
          </label>
          <select
            id="state"
            value={address.state}
            onChange={(e) => updateAddress({ state: e.target.value })}
            onBlur={() => touch("state")}
            aria-invalid={err("state") ? true : undefined}
            aria-describedby={err("state") ? "state-error" : undefined}
            autoComplete="address-level1"
            className={cn(
              "mt-1 w-full rounded-sm border bg-background px-3 py-3 text-base outline-none focus:border-sage",
              err("state") ? "border-destructive" : "border-input",
            )}
          >
            <option value="">UF</option>
            {BR_STATES.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </select>
          {err("state") && (
            <p id="state-error" className="mt-1 text-xs text-destructive">
              {err("state")}
            </p>
          )}
        </div>
      </div>

      <ShippingOptions
        state={quote.state}
        selectedId={shipping?.id ?? null}
        onSelect={(option) => setCheckout({ shipping: option })}
        onRetry={quote.retry}
        error={
          visible("shipping") && !shipping && quote.state.status === "success"
            ? "Escolha uma forma de entrega."
            : undefined
        }
      />

      <PrimaryButton type="submit" className="mt-8" onClick={() => touch("shipping")}>
        Continuar
      </PrimaryButton>
    </form>
  );
}
