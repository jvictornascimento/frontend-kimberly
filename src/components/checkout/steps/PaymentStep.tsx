import { track } from "@/lib/analytics";
import { useEffect, useState } from "react";
import { ChoiceRadio } from "@/components/belyeve/ChoiceRadio";
import { MAX_INSTALLMENTS } from "@/features/checkout/config";
import { useInstallments } from "@/features/checkout/hooks/useInstallments";
import { goToStep, setCheckout } from "@/features/checkout/state/checkout.store";
import type { CheckoutState, PaymentMethod } from "@/features/checkout/types";
import { Notice, PrimaryButton, StepHeader, TextButton } from "../ui";
import { installmentLabel, priceOr } from "../format";

const METHODS: { value: PaymentMethod; label: string; description: string }[] = [
  { value: "pix", label: "PIX", description: "Aprovação rápida. O código é gerado ao finalizar o pedido." },
  { value: "credit_card", label: "Cartão de crédito", description: `Em até ${MAX_INSTALLMENTS}x. Os dados do cartão são pedidos ao finalizar.` },
];

export function PaymentStep({ state, totalCents }: { state: CheckoutState; totalCents: number | null }) {
  const { paymentMethod, installment } = state;
  const [tried, setTried] = useState(false);
  const isCard = paymentMethod === "credit_card";
  const installments = useInstallments(totalCents, isCard);

  // Refresh the stored option when values change (e.g. shipping changed the total).
  useEffect(() => {
    if (installments.status !== "success") return;
    const fresh = installments.data.find((o) => o.installments === installment?.installments) ?? installments.data[0] ?? null;
    if (JSON.stringify(fresh) !== JSON.stringify(installment)) setCheckout({ installment: fresh });
  }, [installments, installment]);

  const ready = paymentMethod === "pix" || (isCard && installment !== null);

  return (
    <div>
      <TextButton onClick={() => goToStep("delivery")}>← Voltar</TextButton>
      <div className="mt-4">
        <StepHeader title="Pagamento" description="Escolha como prefere pagar." />
      </div>

      <fieldset className="mt-6">
        <legend className="sr-only">Forma de pagamento</legend>
        <div className="grid gap-3">
          {METHODS.map((m) => (
            <ChoiceRadio
              key={m.value}
              name="payment-method"
              checked={paymentMethod === m.value}
              onSelect={() => {
                setCheckout({ paymentMethod: m.value });
                track("select_payment_method", { method: m.value });
              }}
              title={m.label}
              description={m.description}
            />
          ))}
        </div>
      </fieldset>

      {isCard && (
        <fieldset className="mt-8" aria-busy={installments.status === "loading"}>
          <legend className="text-sm font-semibold">Parcelamento</legend>
          <div className="mt-3 grid gap-3">
            {installments.status === "loading" && <div className="h-14 animate-pulse rounded-sm bg-muted" role="status" aria-label="Carregando parcelas" />}
            {installments.status === "error" && <Notice tone="error" role="alert">{installments.message} Tente novamente em instantes.</Notice>}
            {installments.status === "success" &&
              installments.data.map((o) => (
                <ChoiceRadio
                  key={o.installments}
                  name="installments"
                  checked={installment?.installments === o.installments}
                  onSelect={() => setCheckout({ installment: o })}
                  title={installmentLabel(o)}
                  description={`Total: ${priceOr(o.totalWithFeesCents, "a confirmar")}`}
                />
              ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            O parcelamento pode ter taxa. Valor da parcela e total final aparecem antes da confirmação.
          </p>
        </fieldset>
      )}

      <PrimaryButton
        className="mt-8"
        onClick={() => {
          setTried(true);
          if (ready) goToStep("review");
        }}
      >
        Revisar pedido
      </PrimaryButton>
      {tried && !ready && (
        <p role="alert" className="mt-2 text-center text-xs text-destructive">
          Escolha a forma de pagamento para continuar.
        </p>
      )}
    </div>
  );
}
