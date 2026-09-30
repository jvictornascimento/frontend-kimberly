import { useEffect, useState } from "react";
import { LAUNCH_PROMO_ENABLED, LAUNCH_PROMO_END_DATE } from "@/data/scoops";
import { cn } from "@/lib/utils";

const END = new Date(LAUNCH_PROMO_END_DATE).getTime();

function split(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    Dias: Math.floor(s / 86400),
    Horas: Math.floor((s % 86400) / 3600),
    Minutos: Math.floor((s % 3600) / 60),
    Segundos: s % 60,
  };
}

/** Contador real até LAUNCH_PROMO_END_DATE. Renderiza após montagem para evitar divergência de SSR. */
export function LaunchCountdown({ className }: { className?: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!LAUNCH_PROMO_ENABLED) return null;
  const ended = now !== null && now >= END;

  return (
    <div className={cn("border-y border-gold/50 py-4 text-center", className)} aria-live="off">
      <p className="eyebrow">Promoção de lançamento</p>
      {ended ? (
        <p className="mt-2 text-sm text-muted-foreground">
          A promoção de lançamento foi encerrada.
        </p>
      ) : (
        <dl className="mt-3 flex justify-center gap-5">
          {Object.entries(
            now === null
              ? { Dias: null, Horas: null, Minutos: null, Segundos: null }
              : split(END - now),
          ).map(([label, v]) => (
            <div key={label} className="min-w-12">
              <dd className="font-display text-3xl leading-none tabular-nums">
                {v === null ? "--" : String(v).padStart(2, "0")}
              </dd>
              <dt className="mt-1 text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                {label}
              </dt>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
