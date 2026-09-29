import { useState } from "react";

/** Shows a field error only after blur or after a submit attempt. */
export function useTouched<K extends string>() {
  const [touched, setTouched] = useState<Partial<Record<K, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  return {
    touch: (field: K) => setTouched((t) => ({ ...t, [field]: true })),
    visible: (field: K) => submitted || touched[field] === true,
    submit: () => setSubmitted(true),
  };
}
