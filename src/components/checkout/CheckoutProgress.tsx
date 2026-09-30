import { cn } from "@/lib/utils";
import type { CheckoutStep } from "@/features/checkout/types";

const CHECKOUT_STEPS: { id: CheckoutStep; label: string }[] = [
  { id: "scoop", label: "Seu Scoop" },
  { id: "customer", label: "Seus dados" },
  { id: "delivery", label: "Entrega" },
  { id: "payment", label: "Pagamento" },
  { id: "review", label: "Revisão" },
];

export function CheckoutProgress({
  current,
  onSelect,
}: {
  current: CheckoutStep;
  onSelect: (s: CheckoutStep) => void;
}) {
  const currentIndex = CHECKOUT_STEPS.findIndex((s) => s.id === current);
  return (
    <nav aria-label="Etapas do checkout">
      <p className="text-xs text-muted-foreground">
        Etapa {currentIndex + 1} de {CHECKOUT_STEPS.length} ·{" "}
        <span className="font-medium text-foreground">{CHECKOUT_STEPS[currentIndex]?.label}</span>
      </p>
      <ol className="mt-2 grid grid-cols-5 gap-1.5">
        {CHECKOUT_STEPS.map((step, i) => {
          const done = i < currentIndex;
          return (
            <li key={step.id}>
              <button
                type="button"
                disabled={!done}
                onClick={() => onSelect(step.id)}
                aria-current={i === currentIndex ? "step" : undefined}
                aria-label={`${step.label}${done ? " (voltar para esta etapa)" : ""}`}
                className={cn(
                  "block h-1 w-full rounded-full transition-colors enabled:cursor-pointer",
                  i <= currentIndex ? "bg-sage-deep" : "bg-border",
                )}
              />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
