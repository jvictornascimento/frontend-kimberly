export type VerificationAction = "checkout_order" | "checkout_payment";
export type ChallengeAppearance = "always" | "execute" | "interaction-only";
export type GetVerificationToken = (
  action: VerificationAction,
  appearance?: ChallengeAppearance,
) => Promise<string | undefined>;
export interface Turnstile {
  render(container: HTMLElement, options: Record<string, unknown>): string;
  execute(id: string): void;
  remove(id: string): void;
}
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}
let scriptPromise: Promise<Turnstile> | undefined;
export function loadTurnstile(): Promise<Turnstile> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    const timer = setTimeout(fail, 15000);
    function fail() {
      clearTimeout(timer);
      script.remove();
      scriptPromise = undefined;
      reject(new Error("Não foi possível carregar a verificação. Tente novamente."));
    }
    script.onerror = fail;
    script.onload = () => {
      clearTimeout(timer);
      if (window.turnstile) resolve(window.turnstile);
      else fail();
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export interface Challenge {
  token: Promise<string>;
  dispose(): void;
}
/** Fresh widget per operation; tokens stay in memory and are never reused. */
export function startChallenge(
  api: Turnstile,
  container: HTMLElement,
  sitekey: string,
  action: VerificationAction,
  appearance: ChallengeAppearance = "interaction-only",
): Challenge {
  let widget: string | undefined;
  let disposed = false;
  let finish: (token?: string) => void = () => {};
  const token = new Promise<string>((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => finish(), 120000);
    finish = (value?: string) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (value) resolve(value);
      else reject(new Error("Não conseguimos confirmar a verificação. Tente novamente."));
    };
    try {
      widget = api.render(container, {
        sitekey,
        action,
        execution: "execute",
        appearance,
        "response-field": false,
        callback: (value: string) => finish(value),
        "error-callback": () => {
          finish();
          return true;
        },
        "expired-callback": () => finish(),
        "timeout-callback": () => finish(),
      });
      api.execute(widget);
    } catch {
      finish();
    }
  });
  return {
    token,
    dispose() {
      if (disposed) return;
      disposed = true;
      finish();
      if (widget !== undefined) api.remove(widget);
    },
  };
}
