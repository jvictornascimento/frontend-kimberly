import type { CheckoutState, OrderTotals } from "@/features/checkout/types";
import { findPackage } from "@/features/checkout/domain/pricing";
import { metalLabel, priceOr, ringsLabel } from "./format";

interface SummaryProps {
  state: CheckoutState;
  totals: OrderTotals;
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4 py-1">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={strong ? "text-right font-semibold" : "text-right"}>{value}</dd>
    </div>
  );
}

function SummaryBody({ state, totals }: SummaryProps) {
  const { selection, shipping } = state;
  return (
    <dl className="text-sm">
      <Row label="Pacote" value={findPackage(selection.quantity).label} />
      <Row label="Categoria" value={metalLabel(selection.metal)} />
      <Row label="Anéis" value={ringsLabel(selection)} />
      {selection.avoidNote.trim() && <Row label="Observação" value={selection.avoidNote.trim()} />}
      <div className="my-2 border-t border-border" />
      <Row label="Subtotal" value={priceOr(totals.subtotalCents, "Valor em breve")} />
      {totals.discountCents != null && <Row label="Desconto" value={`− ${priceOr(totals.discountCents, "")}`} />}
      <Row
        label="Frete"
        value={shipping ? (shipping.priceCents === 0 ? "Grátis" : priceOr(shipping.priceCents, "")) : "A calcular"}
      />
      <div className="my-2 border-t border-border" />
      <Row label="Total" value={priceOr(totals.totalCents, "A confirmar")} strong />
    </dl>
  );
}

export function OrderSummaryAside(props: SummaryProps) {
  return (
    <section aria-labelledby="summary-title" className="border border-border bg-card px-5 py-5">
      <h2 id="summary-title" className="eyebrow">
        Resumo do pedido
      </h2>
      <div className="mt-3">
        <SummaryBody {...props} />
      </div>
    </section>
  );
}

/** Collapsible summary for mobile — total always visible. */
export function OrderSummaryMobile(props: SummaryProps) {
  return (
    <details className="group border border-border bg-card">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-sm [&::-webkit-details-marker]:hidden">
        <span>
          <span className="font-medium">Resumo do pedido</span>
          <span className="ml-2 text-xs text-muted-foreground underline underline-offset-4 group-open:hidden">ver</span>
          <span className="ml-2 hidden text-xs text-muted-foreground underline underline-offset-4 group-open:inline">
            ocultar
          </span>
        </span>
        <span className="font-semibold tabular-nums">{priceOr(props.totals.totalCents, "A confirmar")}</span>
      </summary>
      <div className="border-t border-border px-4 py-3">
        <SummaryBody {...props} />
      </div>
    </details>
  );
}
