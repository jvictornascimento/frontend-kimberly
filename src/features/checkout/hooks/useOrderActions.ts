import { useEffect, useRef, useState } from "react";
import { useCheckoutCooldown } from "./useCheckoutCooldown";
import { remainingCooldown } from "../security/cooldown";
import { ApiError } from "../services/api-client";
import type { GetVerificationToken } from "./useTurnstile";
import { PAYMENT_STATUS_POLL_MS } from "../config";
import { toCreateOrderInput } from "../adapters/order.adapter";
import { createOrder, createPayment, getPaymentStatus } from "../services/checkout.service";
import { setCheckout, updatePlacedOrder } from "../state/checkout.store";
import type {
  CardFormData,
  CheckoutState,
  Order,
  OrderStatus,
  PaymentStatus,
  PlacedOrder,
} from "../types";

type ActionStatus = "idle" | "pending" | "error";

/** Creates the order (and the PIX charge). Never marks anything as paid. */
export function useSubmitOrder(getToken: GetVerificationToken) {
  const [status, setStatus] = useState<ActionStatus>("idle");
  const lock = useRef(false);
  const cooldown = useCheckoutCooldown();
  const [error, setError] = useState<string | null>(null);
  const pendingOrder = useRef<Order | null>(null);
  const [shippingExpired, setShippingExpired] = useState(false);

  async function submit(state: CheckoutState, card?: CardFormData) {
    const input = toCreateOrderInput(state);
    setShippingExpired(false);
    if (!input || lock.current || remainingCooldown() > 0) return;
    lock.current = true;
    setStatus("pending");
    setError(null);
    try {
      const order =
        pendingOrder.current ?? (await createOrder(input, await getToken("checkout_order")));
      pendingOrder.current = order;
      const payment =
        input.paymentMethod === "pix"
          ? await createPayment(
              { orderId: order.id, method: "pix" },
              await getToken("checkout_payment"),
            )
          : card
            ? await createPayment(
                {
                  orderId: order.id,
                  method: "credit_card",
                  installments: order.installments ?? 1,
                  card,
                },
                await getToken("checkout_payment"),
              )
            : null;
      pendingOrder.current = null;
      setCheckout({
        placedOrder: { order: payment ? { ...order, status: payment.status } : order, payment },
      });
    } catch (cause) {
      if (!pendingOrder.current && cause instanceof ApiError && cause.status === 409) {
        setShippingExpired(true);
        setCheckout({ shipping: null, installment: null });
      }
      setError(checkoutError(cause));
      lock.current = false;
      setStatus("error");
    }
  }

  return { status, submit, cooldown, error, shippingExpired };
}

export function usePayWithCard(placed: PlacedOrder, getToken: GetVerificationToken) {
  const [status, setStatus] = useState<ActionStatus>("idle");
  const lock = useRef(false);
  const cooldown = useCheckoutCooldown();
  const [error, setError] = useState<string | null>(null);

  async function pay(card: CardFormData) {
    if (lock.current || remainingCooldown() > 0) return;
    lock.current = true;
    setStatus("pending");
    setError(null);
    try {
      const payment = await createPayment(
        {
          orderId: placed.order.id,
          method: "credit_card",
          installments: placed.order.installments ?? 1,
          card,
        },
        await getToken("checkout_payment"),
      );
      updatePlacedOrder({ payment, order: { ...placed.order, status: payment.status } });
    } catch (cause) {
      setError(checkoutError(cause));
      lock.current = false;
      setStatus("error");
    }
  }

  return { status, pay, cooldown, error };
}

const FINAL_STATUSES: OrderStatus[] = ["PAID", "PAYMENT_FAILED", "CANCELLED"];
const PAYMENT_STATUSES: PaymentStatus[] = [
  "AWAITING_PAYMENT",
  "PAYMENT_PROCESSING",
  "PAID",
  "PAYMENT_FAILED",
  "CANCELLED",
];

/** Repairs checkout state saved by an older client that stored the raw API response. */
export function useRecoverPixPayment(placed: PlacedOrder, getToken: GetVerificationToken) {
  const attemptedOrderId = useRef<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [retry, setRetry] = useState(0);
  const cooldown = useCheckoutCooldown();
  const { order, payment } = placed;
  const validPayment = payment?.method === "pix" && PAYMENT_STATUSES.includes(payment.status);

  useEffect(() => {
    if (
      order.paymentMethod !== "pix" ||
      validPayment ||
      attemptedOrderId.current === order.id ||
      remainingCooldown() > 0
    )
      return;
    attemptedOrderId.current = order.id;
    setPending(true);
    setError(null);
    getToken("checkout_payment")
      .then((token) => createPayment({ orderId: order.id, method: "pix" }, token))
      .then((recoveredPayment) => {
        updatePlacedOrder({
          order: { ...order, status: recoveredPayment.status },
          payment: recoveredPayment,
        });
      })
      .catch((cause) => setError(checkoutError(cause)))
      .finally(() => setPending(false));
  }, [order, validPayment, getToken, retry]);
  return {
    error,
    pending,
    cooldown,
    needsRecovery: order.paymentMethod === "pix" && !validPayment,
    recover: () => {
      attemptedOrderId.current = null;
      setRetry((value) => value + 1);
    },
  };
}

function checkoutError(cause: unknown) {
  if (cause instanceof ApiError) {
    if (cause.status === 429)
      return "Você atingiu o limite de tentativas. Aguarde para tentar novamente.";
    if (cause.status === 400 || cause.status === 403)
      return "Confira os dados e tente novamente para refazer a verificação.";
    if (cause.status === 503)
      return "O serviço está temporariamente indisponível. Tente novamente em instantes.";
  }
  return "Não conseguimos concluir a operação. Seus dados foram mantidos. Tente novamente.";
}

/** Polls the backend for the real payment status. */
export function usePaymentStatusPolling(placed: PlacedOrder) {
  const paymentId = placed.payment?.paymentId;
  const isFinal = FINAL_STATUSES.includes(placed.order.status);
  const placedRef = useRef(placed);
  placedRef.current = placed;

  useEffect(() => {
    if (!paymentId || isFinal) return;
    const timer = setInterval(() => {
      getPaymentStatus(paymentId)
        .then((status) => {
          const current = placedRef.current;
          if (!current.payment || status === current.order.status) return;
          updatePlacedOrder({
            order: { ...current.order, status },
            payment: { ...current.payment, status },
          });
        })
        .catch(() => undefined); // transient failure: next tick retries
    }, PAYMENT_STATUS_POLL_MS);
    return () => clearInterval(timer);
  }, [paymentId, isFinal]);
}
