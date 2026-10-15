import { describe, expect, it } from "vitest";
import { restoreSelection } from "./checkout.store";
import type { ScoopSelection } from "../types";

describe("restored checkout preferences", () => {
  it("keeps existing answers but asks the new question on older saved checkouts", () => {
    const restored = restoreSelection({
      quantity: 2,
      metal: "prata",
      wearsRings: false,
      avoidNote: "Não uso pulseiras.",
    });
    expect(restored).toMatchObject({
      quantity: 2,
      metal: "prata",
      wearsRings: false,
      avoidNote: "Não uso pulseiras.",
      allowsReligiousItems: null,
    });
    expect(restoreSelection().allowsReligiousItems).toBeNull();
  });
  it("preserves either explicit boolean without treating stored strings as consent", () => {
    for (const answer of [true, false])
      expect(restoreSelection({ allowsReligiousItems: answer }).allowsReligiousItems).toBe(answer);
    expect(
      restoreSelection({ allowsReligiousItems: "true" } as unknown as Partial<ScoopSelection>)
        .allowsReligiousItems,
    ).toBeNull();
  });
});
