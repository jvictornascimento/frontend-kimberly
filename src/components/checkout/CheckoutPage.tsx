import { BrandLogo } from "@/components/belyeve/BrandLogo";
import { Link } from "@tanstack/react-router";
import { computeTotals } from "@/features/checkout/domain/pricing";
import { goToStep, useCheckout } from "@/features/checkout/state/checkout.store";
import type { CheckoutState, OrderTotals } from "@/features/checkout/types";
import { CheckoutProgress } from "./CheckoutProgress";
import { OrderConfirmation } from "./OrderConfirmation";
import { OrderSummaryAside, OrderSummaryMobile } from "./OrderSummary";
import { CustomerStep } from "./steps/CustomerStep";
import { DeliveryStep } from "./steps/DeliveryStep";
import { PaymentStep } from "./steps/PaymentStep";
import { ReviewStep } from "./steps/ReviewStep";
import { ScoopStep } from "./steps/ScoopStep";

function CurrentStep({ state, totals }: { state: CheckoutState; totals: OrderTotals }) {
  switch (state.step) {
    case "scoop":
      return <ScoopStep selection={state.selection} />;
    case "customer":
      return <CustomerStep customer={state.customer} />;
    case "delivery":
      return <DeliveryStep state={state} />;
    case "payment":
      return <PaymentStep state={state} totalCents={totals.totalCents} />;
    case "review":
      return <ReviewStep state={state} totals={totals} />;
  }
}

export function CheckoutPage() {
  const state = useCheckout();
  const totals = computeTotals(state.selection.quantity, state.shipping);

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
          <Link to="/" aria-label="Voltar para a página inicial">
            <BrandLogo />
          </Link>
          <span className="text-xs text-muted-foreground">Checkout</span>
        </div>
      </header>

      {state.placedOrder ? (
        <OrderConfirmation placed={state.placedOrder} />
      ) : (
        <div className="mx-auto max-w-5xl px-5 py-6 md:grid md:grid-cols-[minmax(0,1fr)_300px] md:gap-10 md:py-10">
          <div className="min-w-0">
            <div className="mb-5 md:hidden">
              <OrderSummaryMobile state={state} totals={totals} />
            </div>
            <CheckoutProgress current={state.step} onSelect={goToStep} />
            <div key={state.step} className="mt-6 animate-in fade-in duration-300">
              <CurrentStep state={state} totals={totals} />
            </div>
          </div>
          <aside className="hidden md:block">
            <div className="sticky top-6">
              <OrderSummaryAside state={state} totals={totals} />
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
