import { useEffect, useRef, useState } from "react";
import { onlyDigits } from "../domain/masks";
import { getAddressByZipCode } from "../services/checkout.service";
import type { AddressLookup } from "../types";

export type ZipLookupStatus = "idle" | "loading" | "found" | "not_found" | "error";

/** Looks up the address once the CEP is complete. `skipInitial` avoids refilling a restored address. */
export function useZipLookup(
  zipCode: string,
  onFound: (address: AddressLookup) => void,
  skipInitial: boolean,
) {
  const [status, setStatus] = useState<ZipLookupStatus>("idle");
  const lastZip = useRef<string | null>(skipInitial ? onlyDigits(zipCode) : null);
  const onFoundRef = useRef(onFound);
  onFoundRef.current = onFound;

  useEffect(() => {
    const zip = onlyDigits(zipCode);
    if (zip.length !== 8) {
      lastZip.current = null;
      setStatus("idle");
      return;
    }
    if (lastZip.current === zip) return;
    lastZip.current = zip;
    let active = true;
    let done = false;
    setStatus("loading");
    getAddressByZipCode(zip)
      .then((address) => {
        done = true;
        if (!active) return;
        if (address) onFoundRef.current(address);
        setStatus(address ? "found" : "not_found");
      })
      .catch(() => {
        done = true;
        if (active) setStatus("error");
      });
    return () => {
      active = false;
      if (!done) lastZip.current = null;
    };
  }, [zipCode]);

  return status;
}
