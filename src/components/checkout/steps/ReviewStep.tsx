import { useState, type ReactNode } from "react";
import { findPackage } from "@/features/checkout/domain/pricing";
import { formatDeliveryEstimate } from "@/features/checkout/domain/shipping-rules";
import { useSubmitOrder } from "@/features/checkout/hooks/useOrderActions";
import { goToStep } from "@/features/checkout/state/checkout.store";
import type { CheckoutState, CheckoutStep, OrderTotals } from "@/features/checkout/types";
import { ConsentField } from "../ConsentField";
import { CardFields } from "../CardFields";
import { installmentLabel, metalLabel, priceOr, ringsLabel } from "../format";
import { Notice, PrimaryButton, StepHeader, TextButton } from "../ui";
import { hasErrors, validateCard } from "@/features/checkout/domain/validation";
import type { CardFormData } from "@/features/checkout/types";

const EMPTY_CARD: CardFormData = { number: "", holderName: "", expiry: "", cvv: "" };

function Block({
  title,
  step,
  children,
}: {
  title: string;
  step: CheckoutStep;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-border py-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold tracking-[0.14em] uppercase">{title}</h3>
        <TextButton onClick={() => goToStep(step)} aria-label={`Editar ${title}`}>
          Editar
        </TextButton>
      </div>
      <div className="mt-2 space-y-0.5 text-sm text-muted-foreground">{children}</div>
    </section>
  );
}

export function ReviewStep({ state, totals }: { state: CheckoutState; totals: OrderTotals }) {
  const { selection, customer, address, shipping, paymentMethod, installment, socialMediaConsent } =
    state;
  const [tried, setTried] = useState(false);
  const [card, setCard] = useState<CardFormData>(EMPTY_CARD);
  const { status, submit, shippingExpired } = useSubmitOrder();
  const pending = status === "pending";
  const cardReady = paymentMethod !== "credit_card" || !hasErrors(validateCard(card));

  return (
    <div>
      <TextButton onClick={() => goToStep("payment")}>← Voltar</TextButton>
      <div className="mt-4">
        <StepHeader title="Revise seu pedido" description="Confira tudo antes de finalizar." />
      </div>

      <div className="mt-4">
        <Block title="Seu Scoop" step="scoop">
          <p>
            {findPackage(selection.quantity).label} · {metalLabel(selection.metal)}
          </p>
          <p>Anéis: {ringsLabel(selection)}</p>
          {selection.avoidNote.trim() && <p>Observação: {selection.avoidNote.trim()}</p>}
        </Block>
        <Block title="Seus dados" step="customer">
          <p>{customer.fullName}</p>
          <p>
            {customer.whatsapp} · {customer.email}
          </p>
          <p>CPF {customer.cpf}</p>
        </Block>
        <Block title="Entrega" step="delivery">
          <p>
            {address.street}, {address.number}
            {address.complement && ` · ${address.complement}`}
          </p>
          <p>
            {address.district} · {address.city}/{address.state} · {address.zipCode}
          </p>
          {shipping && (
            <p className="text-foreground">
              {shipping.kind === "local_delivery"
                ? "Entrega grátis em Pedreira 💚"
                : `${shipping.carrier} ${shipping.service} · ${formatDeliveryEstimate(shipping)}`}
            </p>
          )}
        </Block>
        <Block title="Pagamento" step="payment">
          <p>{paymentMethod === "pix" ? "PIX" : "Cartão de crédito"}</p>
          {paymentMethod === "credit_card" && installment && (
            <p>
              {installmentLabel(installment)} · total{" "}
              {priceOr(installment.totalWithFeesCents, "a confirmar")}
            </p>
          )}
        </Block>
      </div>

      <dl className="mt-4 space-y-1 text-sm">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd>{priceOr(totals.subtotalCents, "Valor em breve")}</dd>
        </div>
        {totals.discountCents != null && (
          <div className="flex justify-between">
            <dt>Desconto</dt>
            <dd>− {priceOr(totals.discountCents, "")}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt>Frete</dt>
          <dd>
            {shipping?.priceCents === 0 ? "Grátis" : priceOr(totals.shippingCents, "A calcular")}
          </dd>
        </div>
        <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
          <dt>Total</dt>
          <dd>
            {priceOr(
              paymentMethod === "credit_card"
                ? (installment?.totalWithFeesCents ?? null)
                : totals.totalCents,
              "A confirmar",
            )}
          </dd>
        </div>
      </dl>

      <ConsentField value={socialMediaConsent} showError={tried && socialMediaConsent === null} />

      {paymentMethod === "credit_card" && (
        <section
          className="mt-6 border border-border bg-card px-5 py-5"
          aria-labelledby="card-title"
        >
          <h2 id="card-title" className="mb-4 text-sm font-semibold">
            Dados do cartão
          </h2>
          <CardFields card={card} onChange={setCard} touched={tried} />
          <p className="mt-3 text-xs text-muted-foreground">
            Os dados são enviados com segurança para processar o pagamento e não ficam salvos no
            pedido.
          </p>
        </section>
      )}

      {status === "error" && (
        <div className="mt-6">
          <Notice tone="error" role="alert">
            {shippingExpired ? (
              <>
                A cotação de frete expirou ou mudou. Seus dados foram mantidos.{" "}
                <TextButton onClick={() => goToStep("delivery")}>
                  Calcular frete novamente
                </TextButton>
              </>
            ) : (
              "Não conseguimos registrar seu pedido agora. Seus dados foram mantidos — tente novamente em instantes."
            )}
          </Notice>
        </div>
      )}

      <PrimaryButton
        className="mt-8"
        disabled={pending}
        aria-busy={pending}
        onClick={() => {
          setTried(true);
          if (socialMediaConsent !== null && cardReady) {
            void submit(state, paymentMethod === "credit_card" ? card : undefined);
          }
        }}
      >
        {pending
          ? "Enviando pedido…"
          : paymentMethod === "credit_card"
            ? "Pagar e finalizar pedido"
            : "Finalizar pedido"}
      </PrimaryButton>
      {tried && !cardReady && (
        <p role="alert" className="mt-2 text-center text-xs text-destructive">
          Confira os dados do cartão para continuar.
        </p>
      )}
    </div>
  );
}
