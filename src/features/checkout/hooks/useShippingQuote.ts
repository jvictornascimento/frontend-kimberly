import { useEffect, useRef, useState } from "react";
import { onlyDigits } from "../domain/masks";
import { calculateShipping } from "../services/checkout.service";
import { ApiError } from "../services/api-client";
import type { AsyncState, ShippingOption, ShippingQuoteInput } from "../types";

const DEBOUNCE_MS = 400;

export function useShippingQuote(input: ShippingQuoteInput) {
  const [state, setState] = useState<AsyncState<ShippingOption[]>>({ status: "idle" });
  const [attempt, setAttempt] = useState(0);
  const [quotedKey, setQuotedKey] = useState("");
  const zip = onlyDigits(input.zipCode);
  const ready = zip.length === 8 && input.city.trim() !== "" && input.state !== "";
  const key = ready
    ? `${zip}|${input.city.trim().toLowerCase()}|${input.state}|${input.quantity}`
    : "";
  const inputRef = useRef(input);
  inputRef.current = { ...input, zipCode: zip };

  useEffect(() => {
    if (!key) {
      setState({ status: "idle" });
      return;
    }
    let active = true;
    setQuotedKey(key);
    setState({ status: "loading" });
    const timer = setTimeout(() => {
      calculateShipping(inputRef.current)
        .then((options) => {
          if (active)
            setState(options.length ? { status: "success", data: options } : { status: "empty" });
        })
        .catch((error: unknown) => {
          if (active)
            setState({
              status: "error",
              message:
                error instanceof ApiError && error.status === 400
                  ? "Confira o CEP, a cidade e o estado. Eles devem corresponder ao endereço de entrega."
                  : "Não conseguimos calcular o frete agora. Tente novamente em instantes.",
            });
        });
    }, DEBOUNCE_MS);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [key, attempt]);

  useEffect(() => {
    if (state.status !== "success") return;
    const expirations = state.data
      .map((option) => (option.expiresAt ? Date.parse(option.expiresAt) : NaN))
      .filter(Number.isFinite);
    if (!expirations.length) return;
    const timer = setTimeout(
      () => setAttempt((n) => n + 1),
      Math.max(0, Math.min(...expirations) - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [state]);

  const currentState: AsyncState<ShippingOption[]> =
    key === quotedKey ? state : { status: ready ? "loading" : "idle" };
  return { state: currentState, retry: () => setAttempt((n) => n + 1) };
}
