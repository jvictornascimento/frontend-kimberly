import { useEffect, useState } from "react";
import { remainingCooldown } from "../security/cooldown";

export function useCheckoutCooldown() {
  const [seconds, setSeconds] = useState(remainingCooldown);
  useEffect(() => {
    const timer = setInterval(() => setSeconds(remainingCooldown()), 250);
    return () => clearInterval(timer);
  }, []);
  return seconds;
}
