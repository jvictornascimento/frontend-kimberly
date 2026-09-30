import { useEffect, useState } from "react";
import { getInstallmentOptions } from "../services/checkout.service";
import type { AsyncState, InstallmentOption } from "../types";

export function useInstallments(totalCents: number | null, enabled: boolean) {
  const [state, setState] = useState<AsyncState<InstallmentOption[]>>({ status: "idle" });

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    setState({ status: "loading" });
    getInstallmentOptions(totalCents)
      .then(
        (options) =>
          active &&
          setState(options.length ? { status: "success", data: options } : { status: "empty" }),
      )
      .catch(
        () =>
          active &&
          setState({ status: "error", message: "Não conseguimos carregar o parcelamento." }),
      );
    return () => {
      active = false;
    };
  }, [totalCents, enabled]);

  return state;
}
