import { useEffect, useRef, useState } from "react";
import { PAYMENT_STATUS_POLL_MS } from "../config";
import { toCreateOrderInput } from "../adapters/order.adapter";
import { createOrder, createPayment, getPaymentStatus } from "../services/checkout.service";
import { setCheckout, updatePlacedOrder } from "../state/checkout.store";
import type { CardFormData, CheckoutState, OrderStatus, PlacedOrder } from "../types";

type ActionStatus = "idle" | "pending" | "error";

/** Creates the order (and the PIX charge). Never marks anything as paid. */
export function useSubmitOrder() {
  const [status, setStatus] = useState<ActionStatus>("idle");
  const lock = useRef(false);

  async function submit(state: CheckoutState) {
    const input = toCreateOrderInput(state);
    if (!input || lock.current) return;
    lock.current = true;
    setStatus("pending");
    try {
      const order = await createOrder(input);
      const payment = input.paymentMethod === "pix" ? await createPayment({ orderId: order.id, method: "pix" }) : null;
      setCheckout({ placedOrder: { order: payment ? { ...order, status: payment.status } : order, payment } });
    } catch {
      lock.current = false;
      setStatus("error");
    }
  }

  return { status, submit };
}

export function usePayWithCard(placed: PlacedOrder) {
  const [status, setStatus] = useState<ActionStatus>("idle");
  const lock = useRef(false);

  async function pay(card: CardFormData) {
    if (lock.current) return;
    lock.current = true;
    setStatus("pending");
    try {
      const payment = await createPayment({
        orderId: placed.order.id,
        method: "credit_card",
        installments: placed.order.installments ?? 1,
        card,
      });
      updatePlacedOrder({ payment, order: { ...placed.order, status: payment.status } });
    } catch {
      lock.current = false;
      setStatus("error");
    }
  }

  return { status, pay };
}

const FINAL_STATUSES: OrderStatus[] = ["PAID", "PAYMENT_FAILED", "CANCELLED"];

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
          updatePlacedOrder({ order: { ...current.order, status }, payment: { ...current.payment, status } });
        })
        .catch(() => undefined); // transient failure: next tick retries
    }, PAYMENT_STATUS_POLL_MS);
    return () => clearInterval(timer);
  }, [paymentId, isFinal]);
}
