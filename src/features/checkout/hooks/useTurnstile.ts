import { useCallback, useEffect, useRef } from "react";
import { TURNSTILE_SITE_KEY, USE_MOCKS } from "../config";
import {
  loadTurnstile,
  startChallenge,
  type Challenge,
  type GetVerificationToken,
} from "../security/turnstile";
export type { GetVerificationToken } from "../security/turnstile";

export function useTurnstile() {
  const containerRef = useRef<HTMLDivElement>(null);
  const active = useRef<Challenge | null>(null);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      active.current?.dispose();
    };
  }, []);
  const getToken = useCallback<GetVerificationToken>(async (action) => {
    if (USE_MOCKS || !TURNSTILE_SITE_KEY) return undefined;
    const api = await loadTurnstile();
    if (!mounted.current || !containerRef.current) throw new Error("Verificação interrompida.");
    active.current?.dispose();
    active.current = startChallenge(api, containerRef.current, TURNSTILE_SITE_KEY, action);
    return active.current.token;
  }, []);
  return { containerRef, getToken };
}
