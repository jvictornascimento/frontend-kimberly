/**
 * Checkout state shared by the landing selector and the /checkout page.
 * Persisted in sessionStorage so navigating between steps keeps the data.
 * Card data is NEVER part of this state.
 */
import { useSyncExternalStore } from "react";
import { EMPTY_ORDER } from "@/data/scoops";
import { CHECKOUT_STORAGE_KEY } from "../config";
import type {
  Address,
  CheckoutState,
  CheckoutStep,
  Customer,
  PlacedOrder,
  ScoopSelection,
} from "../types";

const INITIAL_STATE: CheckoutState = {
  selection: EMPTY_ORDER,
  customer: { fullName: "", whatsapp: "", email: "", cpf: "" },
  address: {
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    district: "",
    city: "",
    state: "",
  },
  shipping: null,
  paymentMethod: null,
  installment: null,
  socialMediaConsent: null,
  step: "scoop",
  placedOrder: null,
};

/** Older saved checkouts must ask the new question instead of assuming an answer. */
export function restoreSelection(saved?: Partial<ScoopSelection>): ScoopSelection {
  return {
    ...EMPTY_ORDER,
    ...saved,
    allowsReligiousItems:
      typeof saved?.allowsReligiousItems === "boolean" ? saved.allowsReligiousItems : null,
  };
}

function load(): CheckoutState {
  if (typeof window === "undefined") return INITIAL_STATE;
  try {
    const raw = window.sessionStorage.getItem(CHECKOUT_STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const saved = JSON.parse(raw) as Partial<CheckoutState>;
    return { ...INITIAL_STATE, ...saved, selection: restoreSelection(saved.selection) };
  } catch {
    return INITIAL_STATE;
  }
}

let state: CheckoutState = load();
const listeners = new Set<() => void>();

function commit(next: CheckoutState) {
  state = next;
  try {
    window.sessionStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable (private mode) — state still works in memory
  }
  listeners.forEach((l) => l());
}

export function setCheckout(patch: Partial<CheckoutState>) {
  commit({ ...state, ...patch });
}

export const updateSelection = (patch: Partial<ScoopSelection>) =>
  setCheckout({ selection: { ...state.selection, ...patch } });

export const updateCustomer = (patch: Partial<Customer>) =>
  setCheckout({ customer: { ...state.customer, ...patch } });

export const updateAddress = (patch: Partial<Address>) =>
  setCheckout({ address: { ...state.address, ...patch } });

export function goToStep(step: CheckoutStep) {
  setCheckout({ step });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function updatePlacedOrder(patch: Partial<PlacedOrder>) {
  if (state.placedOrder) setCheckout({ placedOrder: { ...state.placedOrder, ...patch } });
}

export function resetCheckout() {
  commit(INITIAL_STATE);
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useCheckout(): CheckoutState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => INITIAL_STATE,
  );
}
