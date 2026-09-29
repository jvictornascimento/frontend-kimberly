import { useEffect, useRef, useState } from "react";
import { onlyDigits } from "../domain/masks";
import { calculateShipping } from "../services/checkout.service";
import type { AsyncState, ShippingOption, ShippingQuoteInput } from "../types";

const DEBOUNCE_MS = 400;

export function useShippingQuote(input: ShippingQuoteInput) {
  const [state, setState] = useState<AsyncState<ShippingOption[]>>({ status: "idle" });
  const [attempt, setAttempt] = useState(0);
  const zip = onlyDigits(input.zipCode);
  const ready = zip.length === 8 && input.city.trim() !== "" && input.state !== "";
  const key = ready ? `${zip}|${input.city.trim().toLowerCase()}|${input.state}|${input.quantity}` : "";
  const inputRef = useRef(input);
  inputRef.current = { ...input, zipCode: zip };

  useEffect(() => {
    if (!key) {
      setState({ status: "idle" });
      return;
    }
    let active = true;
    setState({ status: "loading" });
    const timer = setTimeout(() => {
      calculateShipping(inputRef.current)
        .then((options) => {
          if (active) setState(options.length ? { status: "success", data: options } : { status: "empty" });
        })
        .catch(() => {
          if (active)
            setState({ status: "error", message: "Não conseguimos calcular o frete agora. Tente novamente em instantes." });
        });
    }, DEBOUNCE_MS);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [key, attempt]);

  return { state, retry: () => setAttempt((n) => n + 1) };
}
