import { Link } from "@tanstack/react-router";
import { usePaymentStatusPolling } from "@/features/checkout/hooks/useOrderActions";
import { resetCheckout } from "@/features/checkout/state/checkout.store";
import type { OrderStatus, PlacedOrder } from "@/features/checkout/types";
import { CardForm } from "./CardForm";
import { PixPanel } from "./PixPanel";
import { Notice } from "./ui";
import { priceOr } from "./format";

const STATUS_COPY: Record<
  OrderStatus,
  { title: string; text: string; tone: "neutral" | "success" | "error" }
> = {
  DRAFT: {
    title: "Pedido recebido 💚",
    text: "Estamos aguardando a confirmação do pagamento.",
    tone: "neutral",
  },
  CREATING_ORDER: { title: "Registrando seu pedido…", text: "Só um instante.", tone: "neutral" },
  AWAITING_PAYMENT: {
    title: "Pedido recebido 💚",
    text: "Estamos aguardando a confirmação do pagamento.",
    tone: "neutral",
  },
  PAYMENT_PROCESSING: {
    title: "Pedido recebido 💚",
    text: "Seu pagamento está em análise. Avisamos assim que for confirmado.",
    tone: "neutral",
  },
  PAID: {
    title: "Pagamento confirmado!",
    text: "Vamos falar com você pelo WhatsApp, gravar seu Scoop e enviar o vídeo. O preparo começa depois da sua confirmação por lá.",
    tone: "success",
  },
  PAYMENT_FAILED: {
    title: "Pagamento não confirmado",
    text: "Não conseguimos confirmar o pagamento. Tente novamente ou fale com a gente pelo WhatsApp.",
    tone: "error",
  },
  CANCELLED: {
    title: "Pedido cancelado",
    text: "Este pedido foi cancelado. Se foi um engano, faça um novo pedido.",
    tone: "error",
  },
};

export function OrderConfirmation({ placed }: { placed: PlacedOrder }) {
  usePaymentStatusPolling(placed);
  const { order, payment } = placed;
  const copy = STATUS_COPY[order.status];
  const needsCard = order.paymentMethod === "credit_card" && payment === null;

  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <h1 className="font-display text-4xl leading-tight">{copy.title}</h1>
      <div className="mt-4" role="status" aria-live="polite">
        <Notice tone={copy.tone}>{copy.text}</Notice>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Pedido <span className="font-medium text-foreground">{order.id}</span> · Total{" "}
        {priceOr(order.totals.totalCents, "a confirmar")}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Você recebe uma mensagem no WhatsApp {order.customer.whatsapp && "informado"} com os
        próximos passos
        {order.shipping.kind === "local_delivery" && " e para combinarmos a entrega em Pedreira"}.
      </p>

      {payment?.method === "pix" && order.status === "AWAITING_PAYMENT" && (
        <PixPanel payment={payment} />
      )}
      {needsCard && <CardForm placed={placed} />}

      <Link
        to="/"
        onClick={() => resetCheckout()}
        className="mt-10 inline-block text-xs font-medium underline underline-offset-4"
      >
        Voltar para a página inicial
      </Link>
    </div>
  );
}
