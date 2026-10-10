import { describe, expect, it } from "vitest";
import type { ScoopSelection } from "../types";
import {
  isValidCep,
  isValidCpf,
  isValidEmail,
  isValidPhone,
  preferencesError,
  validateAddress,
  validateCustomer,
  hasErrors,
} from "./validation";

const selection = (overrides: Partial<ScoopSelection> = {}): ScoopSelection => ({
  quantity: 1,
  metal: "dourado",
  wearsRings: false,
  ringSize: null,
  allowsMalePieces: false,
  maleMetal: null,
  allowsPiercing: false,
  piercingLocations: [],
  avoidNote: "",
  ...overrides,
});

describe("checkout preference validation", () => {
  it("requires a metal category", () => {
    expect(preferencesError(selection({ metal: null }))).toBe(
      "Escolha a categoria para continuar.",
    );
  });

  it("requires an answer about ring usage", () => {
    expect(preferencesError(selection({ wearsRings: null }))).toBe(
      "Conte se você gosta de anéis para continuar.",
    );
  });

  it("does not require ring size when rings are not used", () => {
    expect(preferencesError(selection({ wearsRings: false, ringSize: null }))).toBeNull();
  });

  it("requires ring size when rings are used", () => {
    expect(preferencesError(selection({ wearsRings: true, ringSize: "   " }))).toBe(
      "Informe o tamanho do seu anel para continuar.",
    );
    expect(preferencesError(selection({ wearsRings: true, ringSize: "16" }))).toBeNull();
  });

  it("keeps jewelry restrictions optional", () => {
    expect(preferencesError(selection({ avoidNote: "" }))).toBeNull();
    expect(preferencesError(selection({ avoidNote: "Não uso pulseiras." }))).toBeNull();
  });

  it("requires male jewelry category when male pieces are enabled", () => {
    expect(preferencesError(selection({ allowsMalePieces: null }))).toBe(
      "Conte se pode conter peças masculinas para continuar.",
    );
    expect(preferencesError(selection({ allowsMalePieces: true, maleMetal: null }))).toBe(
      "Escolha a categoria das peças masculinas para continuar.",
    );
    expect(preferencesError(selection({ allowsMalePieces: true, maleMetal: "misto" }))).toBeNull();
  });

  it("requires a piercing location when piercing is enabled", () => {
    expect(preferencesError(selection({ allowsPiercing: null }))).toBe(
      "Conte se pode conter piercing de furo para continuar.",
    );
    expect(preferencesError(selection({ allowsPiercing: true, piercingLocations: [] }))).toBe(
      "Escolha onde pode conter piercing de furo para continuar.",
    );
    expect(
      preferencesError(selection({ allowsPiercing: true, piercingLocations: ["nariz"] })),
    ).toBeNull();
  });
});

describe("checkout field validation", () => {
  it("validates common customer inputs", () => {
    expect(isValidCpf("529.982.247-25")).toBe(true);
    expect(isValidCpf("111.111.111-11")).toBe(false);
    expect(isValidPhone("(19) 99999-9999")).toBe(true);
    expect(isValidPhone("(10) 99999-9999")).toBe(false);
    expect(isValidEmail("cliente@example.com")).toBe(true);
    expect(isValidEmail("cliente@example")).toBe(false);
    expect(isValidCep("13920-000")).toBe(true);
    expect(isValidCep("1392")).toBe(false);
  });

  it("returns field errors for invalid customer and address data", () => {
    expect(
      validateCustomer({
        fullName: "Kimberly",
        whatsapp: "123",
        email: "kimberly",
        cpf: "111.111.111-11",
      }),
    ).toEqual({
      fullName: "Informe seu nome e sobrenome.",
      whatsapp: "Informe um WhatsApp com DDD, ex.: (19) 99999-9999.",
      email: "Confira o e-mail, ex.: nome@email.com.",
      cpf: "CPF inválido. Confira os números.",
    });

    const addressErrors = validateAddress({
      zipCode: "123",
      street: "",
      number: "",
      complement: "",
      district: "",
      city: "",
      state: "XX",
    });

    expect(hasErrors(addressErrors)).toBe(true);
    expect(addressErrors).toMatchObject({
      zipCode: "O CEP precisa ter 8 números.",
      street: "Informe a rua.",
      number: "Informe o número (ou S/N).",
      district: "Informe o bairro.",
      city: "Informe a cidade.",
      state: "Selecione o estado.",
    });
  });
});
