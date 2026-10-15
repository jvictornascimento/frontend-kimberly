import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EMPTY_ORDER } from "@/data/scoops";
import { PreferencesFields } from "./PreferencesFields";

function religiousField(answer: boolean | null) {
  const markup = renderToStaticMarkup(
    createElement(PreferencesFields, {
      value: { ...EMPTY_ORDER, allowsReligiousItems: answer },
      onChange: () => {},
    }),
  );
  const field = markup
    .match(/<fieldset[\s\S]*?<\/fieldset>/g)
    ?.find((part) => part.includes('name="religious-items"'));
  expect(field).toContain("Você aceita receber artigos religiosos?");
  return field!;
}
describe("religious items question", () => {
  it("offers two unselected radio options initially", () => {
    const field = religiousField(null);
    expect(field.match(/type="radio"/g)).toHaveLength(2);
    expect(field).toContain("Não");
    expect(field).toContain("Sim");
    expect(field).not.toContain('checked=""');
  });
  it("selects exactly one option for either explicit answer", () => {
    for (const answer of [true, false])
      expect(religiousField(answer).match(/checked=""/g)).toHaveLength(1);
  });
});
