import { ChoiceRadio } from "@/components/belyeve/ChoiceRadio";
import { formatDeliveryEstimate } from "@/features/checkout/domain/shipping-rules";
import type { AsyncState, ShippingOption } from "@/features/checkout/types";
import { Notice, TextButton } from "./ui";
import { priceOr } from "./format";

interface ShippingOptionsProps {
  state: AsyncState<ShippingOption[]>;
  selectedId: string | null;
  onSelect: (option: ShippingOption) => void;
  onRetry: () => void;
  error?: string | undefined;
}

export function ShippingOptions({
  state,
  selectedId,
  onSelect,
  onRetry,
  error,
}: ShippingOptionsProps) {
  return (
    <section
      aria-labelledby="shipping-title"
      aria-busy={state.status === "loading"}
      className="mt-8"
    >
      <h3 id="shipping-title" className="text-sm font-semibold">
        Forma de entrega
      </h3>
      <div className="mt-3 min-h-16">
        {state.status === "idle" && (
          <p className="text-sm text-muted-foreground">
            Informe o CEP e a cidade para ver as opções de entrega.
          </p>
        )}
        {state.status === "loading" && (
          <div role="status" className="space-y-2">
            <span className="sr-only">Calculando frete…</span>
            <div className="h-14 animate-pulse rounded-sm bg-muted" />
            <div className="h-14 animate-pulse rounded-sm bg-muted" />
          </div>
        )}
        {state.status === "empty" && (
          <Notice role="alert">
            Não encontramos opções de entrega para este CEP. Confira o CEP informado ou tente outro
            endereço.
          </Notice>
        )}
        {state.status === "error" && (
          <Notice tone="error" role="alert">
            {state.message} <TextButton onClick={onRetry}>Tentar novamente</TextButton>
          </Notice>
        )}
        {state.status === "success" && (
          <div className="grid gap-3">
            {state.data.map((option) =>
              option.kind === "local_delivery" ? (
                <Notice key={option.id} tone="success" role="status">
                  <p className="font-semibold">Entrega grátis em Pedreira 💚</p>
                  <p className="mt-1 text-xs">
                    A entrega é feita pela própria BELYEVE. Depois do pedido, combinamos os detalhes
                    pelo WhatsApp.
                  </p>
                </Notice>
              ) : (
                <ChoiceRadio
                  key={option.id}
                  name="shipping"
                  checked={selectedId === option.id}
                  onSelect={() => onSelect(option)}
                  title={`${option.carrier} · ${option.service}`}
                  description={formatDeliveryEstimate(option)}
                  aside={priceOr(option.priceCents, "")}
                />
              ),
            )}
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </section>
  );
}
