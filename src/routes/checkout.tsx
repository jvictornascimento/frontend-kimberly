import { createFileRoute } from "@tanstack/react-router";
import { CheckoutPage } from "@/components/checkout/CheckoutPage";

const title = "Finalizar pedido — BELYEVE Scoop Surpresa";
const description = "Finalize seu Scoop Surpresa BELYEVE: seus dados, entrega, pagamento por PIX ou cartão e revisão do pedido.";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CheckoutPage,
});
