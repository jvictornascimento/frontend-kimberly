import { ChoiceRadio } from "@/components/belyeve/ChoiceRadio";
import { setCheckout } from "@/features/checkout/state/checkout.store";

/** Mandatory, never pre-selected, both answers equally easy. */
export function ConsentField({ value, showError }: { value: boolean | null; showError: boolean }) {
  return (
    <fieldset className="mt-8" aria-describedby={showError ? "consent-error" : undefined}>
      <legend className="text-sm font-semibold">Podemos publicar o vídeo do seu Scoop nas redes sociais da BELYEVE?</legend>
      <div className="mt-3 grid gap-3">
        <ChoiceRadio
          name="social-consent"
          checked={value === true}
          onSelect={() => setCheckout({ socialMediaConsent: true })}
          title="Sim, autorizo"
          description="Sim, autorizo a publicação no Instagram e TikTok."
        />
        <ChoiceRadio
          name="social-consent"
          checked={value === false}
          onSelect={() => setCheckout({ socialMediaConsent: false })}
          title="Não autorizo"
          description="Não autorizo a publicação do meu vídeo."
        />
      </div>
      {showError && (
        <p id="consent-error" role="alert" className="mt-2 text-xs text-destructive">
          Responda se podemos publicar o vídeo para finalizar.
        </p>
      )}
    </fieldset>
  );
}
