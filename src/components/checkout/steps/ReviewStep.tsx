import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { findPackage } from "@/features/checkout/domain/pricing";
import { formatDeliveryEstimate } from "@/features/checkout/domain/shipping-rules";
import { useTurnstile, type GetVerificationToken } from "@/features/checkout/hooks/useTurnstile";
import { USE_MOCKS } from "@/features/checkout/config";
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
const ORDER_TOKEN_MAX_AGE_MS = 4 * 60 * 1000;

type VerificationStatus = "checking" | "verified" | "error" | "consumed";

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
  const { containerRef, getToken } = useTurnstile();
  const orderToken = useRef<{ value: string; issuedAt: number } | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("checking");
  const [verificationAttempt, setVerificationAttempt] = useState(0);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    orderToken.current = null;
    setVerificationStatus("checking");
    setVerificationError(null);
    getToken("checkout_order", "always")
      .then((token) => {
        if (!current) return;
        if (!USE_MOCKS && !token) {
          throw new Error("Não foi possível iniciar a verificação. Tente novamente.");
        }
        orderToken.current = token ? { value: token, issuedAt: Date.now() } : null;
        setVerificationStatus("verified");
      })
      .catch((cause: unknown) => {
        if (!current) return;
        orderToken.current = null;
        setVerificationError(
          cause instanceof Error
            ? cause.message
            : "Não foi possível concluir a verificação. Tente novamente.",
        );
        setVerificationStatus("error");
      });
    return () => {
      current = false;
      orderToken.current = null;
    };
  }, [getToken, verificationAttempt]);

  useEffect(() => {
    const savedToken = orderToken.current;
    if (verificationStatus !== "verified" || !savedToken) return;
    const remaining = ORDER_TOKEN_MAX_AGE_MS - (Date.now() - savedToken.issuedAt);
    const refresh = () => {
      if (orderToken.current !== savedToken) return;
      orderToken.current = null;
      setVerificationStatus("checking");
      setVerificationAttempt((attempt) => attempt + 1);
    };
    if (remaining <= 0) {
      refresh();
      return;
    }
    const timer = window.setTimeout(refresh, remaining);
    return () => window.clearTimeout(timer);
  }, [verificationStatus, verificationAttempt]);

  const getSubmitToken = useCallback<GetVerificationToken>(
    async (action) => {
      if (action !== "checkout_order" || USE_MOCKS) return getToken(action);
      const savedToken = orderToken.current;
      if (!savedToken || Date.now() - savedToken.issuedAt >= ORDER_TOKEN_MAX_AGE_MS) {
        throw new Error("A verificação expirou. Confirme novamente para continuar.");
      }
      orderToken.current = null;
      setVerificationStatus("consumed");
      return savedToken.value;
    },
    [getToken],
  );

  const retryVerification = () => {
    orderToken.current = null;
    setVerificationAttempt((attempt) => attempt + 1);
  };

  const { status, submit, shippingExpired, cooldown, error } = useSubmitOrder(getSubmitToken);

  useEffect(() => {
    if (status === "error" && verificationStatus === "consumed") {
      setVerificationStatus("checking");
      setVerificationAttempt((attempt) => attempt + 1);
    }
  }, [status, verificationStatus]);

  const pending = status === "pending";
  const religiousAnswered = typeof selection.allowsReligiousItems === "boolean";
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
          <p>
            Artigos religiosos:{" "}
            {religiousAnswered ? (selection.allowsReligiousItems ? "Sim" : "Não") : "Não informado"}
          </p>
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

      {!religiousAnswered && (
        <div className="mt-6">
          <Notice role="alert">
            Responda se você aceita receber artigos religiosos antes de finalizar.
          </Notice>
          <TextButton onClick={() => goToStep("scoop")}>
            Responder sobre artigos religiosos
          </TextButton>
        </div>
      )}

      {!USE_MOCKS && (
        <section
          className="mt-6 border border-border bg-card px-5 py-5"
          aria-labelledby="human-check-title"
        >
          <h2 id="human-check-title" className="text-sm font-semibold">
            Confirme que você é humano
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Conclua a verificação para liberar a finalização do pedido.
          </p>
          <div ref={containerRef} className="mt-4 flex min-h-16 justify-center" />
          <p className="mt-2 text-sm" role="status" aria-live="polite">
            {verificationStatus === "checking" && "Aguardando a verificação…"}
            {verificationStatus === "verified" && "Verificação concluída. Você já pode finalizar."}
            {verificationStatus === "consumed" && "Verificação confirmada."}
          </p>
          {verificationStatus === "error" && (
            <div className="mt-2">
              <Notice tone="error" role="alert">
                {verificationError ?? "Não foi possível concluir a verificação."}{" "}
                <TextButton onClick={retryVerification}>Tentar novamente</TextButton>
              </Notice>
            </div>
          )}
        </section>
      )}
      {cooldown > 0 && (
        <p role="status" className="mt-4 text-sm">
          Aguarde {cooldown} segundos para tentar novamente.
        </p>
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
              error
            )}
          </Notice>
        </div>
      )}

      <PrimaryButton
        className="mt-8"
        disabled={
          pending || !religiousAnswered || cooldown > 0 || verificationStatus !== "verified"
        }
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
