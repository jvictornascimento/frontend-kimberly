import { cn } from "@/lib/utils";
import { METAL_CATEGORIES, RING_SIZES } from "@/data/scoops";
import type { ScoopPreferences } from "@/features/checkout/types";
import { ChoiceRadio } from "./ChoiceRadio";

interface PreferencesFieldsProps {
  value: ScoopPreferences;
  onChange: (patch: Partial<ScoopPreferences>) => void;
}

/** Category, rings and "pieces I don't wear". Shared by the landing and the checkout. */
export function PreferencesFields({ value, onChange }: PreferencesFieldsProps) {
  return (
    <>
      <fieldset className="mt-8">
        <legend className="text-sm font-semibold">Qual categoria você prefere?</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {METAL_CATEGORIES.map((c) => (
            <ChoiceRadio
              key={c.value}
              name="metal"
              checked={value.metal === c.value}
              onSelect={() => onChange({ metal: c.value })}
              title={c.label}
              description={c.description}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-8">
        <legend className="text-sm font-semibold">Você usa anéis?</legend>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {[
            { label: "Sim", flag: true },
            { label: "Não", flag: false },
          ].map((opt) => (
            <ChoiceRadio
              key={opt.label}
              name="rings"
              checked={value.wearsRings === opt.flag}
              onSelect={() => onChange({ wearsRings: opt.flag, ringSize: opt.flag ? value.ringSize : null })}
              title={opt.label}
              center
            />
          ))}
        </div>

        <div
          className={cn(
            "grid transition-all duration-300 ease-out",
            value.wearsRings ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
          aria-hidden={!value.wearsRings}
        >
          <div className="overflow-hidden">
            <p className="text-sm font-semibold" id="ring-size-label">
              Qual o tamanho do seu anel?
            </p>
            {RING_SIZES.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-labelledby="ring-size-label">
                {RING_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    role="radio"
                    aria-checked={value.ringSize === size}
                    tabIndex={value.wearsRings ? 0 : -1}
                    onClick={() => onChange({ ringSize: size })}
                    className={cn(
                      "h-11 min-w-11 rounded-sm border px-3 text-sm transition-colors",
                      value.ringSize === size ? "border-gold bg-secondary/60 font-semibold" : "border-border",
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            ) : (
              <input
                inputMode="numeric"
                maxLength={4}
                tabIndex={value.wearsRings ? 0 : -1}
                value={value.ringSize ?? ""}
                onChange={(e) => onChange({ ringSize: e.target.value.replace(/[^\d]/g, "") })}
                placeholder="Ex.: 16"
                aria-labelledby="ring-size-label"
                className="mt-2 w-32 rounded-sm border border-input bg-background px-4 py-3 text-base outline-none focus:border-sage"
              />
            )}
          </div>
        </div>
      </fieldset>

      <label className="mt-8 block">
        <span className="text-sm font-semibold">Tem algum tipo de peça que você não usa?</span>
        <span className="ml-1 text-xs text-muted-foreground">(opcional)</span>
        <textarea
          rows={2}
          maxLength={200}
          value={value.avoidNote}
          onChange={(e) => onChange({ avoidNote: e.target.value })}
          placeholder="Ex.: não uso pulseiras."
          className="mt-2 w-full resize-none rounded-sm border border-input bg-background px-4 py-3 text-base outline-none focus:border-sage"
        />
      </label>
    </>
  );
}
