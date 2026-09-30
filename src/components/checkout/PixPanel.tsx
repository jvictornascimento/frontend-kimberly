import { useState } from "react";
import type { PixPayment } from "@/features/checkout/types";
import { PrimaryButton } from "./ui";

export function PixPanel({ payment }: { payment: PixPayment }) {
  const [copied, setCopied] = useState(false);
  const expires = new Date(payment.expiresAt).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  async function copy() {
    try {
      await navigator.clipboard.writeText(payment.copyPasteCode);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section aria-labelledby="pix-title" className="mt-8 border border-border bg-card px-5 py-5">
      <h2 id="pix-title" className="text-sm font-semibold">
        Pague com PIX
      </h2>
      <div className="mx-auto mt-4 flex aspect-square w-48 items-center justify-center border border-dashed border-gold bg-background">
        {payment.qrCodeImageUrl ? (
          <img
            src={payment.qrCodeImageUrl}
            alt="QR Code PIX"
            className="h-full w-full object-contain"
          />
        ) : (
          <span className="px-4 text-center text-xs text-muted-foreground">
            O QR Code do pagamento aparecerá aqui
          </span>
        )}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">Código copia e cola</p>
      <p className="mt-1 break-all rounded-sm bg-muted px-3 py-2 font-mono text-xs">
        {payment.copyPasteCode}
      </p>
      <PrimaryButton className="mt-4" onClick={copy}>
        {copied ? "Código copiado" : "Copiar código PIX"}
      </PrimaryButton>
      <p className="mt-2 text-center text-xs text-muted-foreground" aria-live="polite">
        Válido até {expires}.
      </p>
    </section>
  );
}
