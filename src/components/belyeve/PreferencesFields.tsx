import { cn } from "@/lib/utils";
import { METAL_CATEGORIES, RING_SIZES } from "@/data/scoops";
import type { PiercingLocation } from "@/data/scoops";
import type { ScoopPreferences } from "@/features/checkout/types";
import { ChoiceRadio } from "./ChoiceRadio";
import flowerGold from "@/assets/flower-gold.png";
import flowerSilver from "@/assets/flower-silver.png";

const METAL_FLOWERS: Record<string, string> = {
  dourado: flowerGold,
  prata: flowerSilver,
  misto: flowerGold,
};

const PIERCING_OPTIONS: { value: PiercingLocation; label: string }[] = [
  { value: "nariz", label: "Nariz" },
  { value: "helix", label: "Orelha (hélix)" },
];

interface PreferencesFieldsProps {
  value: ScoopPreferences;
  onChange: (patch: Partial<ScoopPreferences>) => void;
}

/** Scoop preferences shared by the landing and the checkout. */
export function PreferencesFields({ value, onChange }: PreferencesFieldsProps) {
  return (
    <>
      <fieldset className="mt-8">
        <legend className="text-sm font-semibold">Você prefere semijoias:</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {METAL_CATEGORIES.map((c) => (
            <ChoiceRadio
              key={c.value}
              name="metal"
              checked={value.metal === c.value}
              onSelect={() => onChange({ metal: c.value })}
              title={c.label}
              description={c.description}
              aside={
                <img
                  src={METAL_FLOWERS[c.value]}
                  alt=""
                  aria-hidden
                  className="h-8 w-auto opacity-90"
                />
              }
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-8">
        <legend className="text-sm font-semibold">Você gosta de anéis?</legend>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {[
            { label: "Sim", flag: true },
            { label: "Não", flag: false },
          ].map((opt) => (
            <ChoiceRadio
              key={opt.label}
              name="rings"
              checked={value.wearsRings === opt.flag}
              onSelect={() =>
                onChange({ wearsRings: opt.flag, ringSize: opt.flag ? value.ringSize : null })
              }
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
              <div
                className="mt-3 flex flex-wrap gap-2"
                role="radiogroup"
                aria-labelledby="ring-size-label"
              >
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
                      value.ringSize === size
                        ? "border-gold bg-secondary/60 font-semibold"
                        : "border-border",
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

      <fieldset className="mt-8">
        <legend className="text-sm font-semibold">Pode conter peças masculinas?</legend>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {[
            { label: "Não", flag: false },
            { label: "Sim", flag: true },
          ].map((opt) => (
            <ChoiceRadio
              key={opt.label}
              name="male-pieces"
              checked={value.allowsMalePieces === opt.flag}
              onSelect={() =>
                onChange({
                  allowsMalePieces: opt.flag,
                  maleMetal: opt.flag ? value.maleMetal : null,
                })
              }
              title={opt.label}
              center
            />
          ))}
        </div>

        <div
          className={cn(
            "grid transition-all duration-300 ease-out",
            value.allowsMalePieces
              ? "mt-4 grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0",
          )}
          aria-hidden={!value.allowsMalePieces}
        >
          <div className="overflow-hidden">
            <p className="text-sm font-semibold">Categoria para peças masculinas</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {METAL_CATEGORIES.map((c) => (
                <ChoiceRadio
                  key={c.value}
                  name="male-metal"
                  checked={value.maleMetal === c.value}
                  onSelect={() => onChange({ maleMetal: c.value })}
                  title={c.label}
                  description={c.description}
                />
              ))}
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset className="mt-8">
        <legend className="text-sm font-semibold">Pode conter piercing de furo Prata 925?</legend>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {[
            { label: "Não", flag: false },
            { label: "Sim", flag: true },
          ].map((opt) => (
            <ChoiceRadio
              key={opt.label}
              name="piercing"
              checked={value.allowsPiercing === opt.flag}
              onSelect={() =>
                onChange({
                  allowsPiercing: opt.flag,
                  piercingLocations: opt.flag ? value.piercingLocations : [],
                })
              }
              title={opt.label}
              center
            />
          ))}
        </div>

        <div
          className={cn(
            "grid transition-all duration-300 ease-out",
            value.allowsPiercing ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
          aria-hidden={!value.allowsPiercing}
        >
          <div className="overflow-hidden">
            <p className="text-sm font-semibold">Onde pode conter?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {PIERCING_OPTIONS.map((option) => {
                const selected = value.piercingLocations.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    tabIndex={value.allowsPiercing ? 0 : -1}
                    onClick={() =>
                      onChange({
                        piercingLocations: selected
                          ? value.piercingLocations.filter((item) => item !== option.value)
                          : [...value.piercingLocations, option.value],
                      })
                    }
                    className={cn(
                      "min-h-11 rounded-sm border px-4 py-2 text-sm transition-colors",
                      selected ? "border-gold bg-secondary/60 font-semibold" : "border-border",
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset className="mt-8">
        <legend className="text-sm font-semibold">Você aceita receber artigos religiosos?</legend>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {[
            { label: "Não", flag: false },
            { label: "Sim", flag: true },
          ].map((option) => (
            <ChoiceRadio
              key={option.label}
              name="religious-items"
              checked={value.allowsReligiousItems === option.flag}
              onSelect={() => onChange({ allowsReligiousItems: option.flag })}
              title={option.label}
              center
            />
          ))}
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
